/**
 * WebAssembly C module for computing edit distance.
 *
 * Copyright © 2023 James Seo <james@equiv.tech> (MIT license).
 *
 * Performs the specific task of computing the edit distances between one
 * query string and multiple BCP47-like locale tags or display names. (See
 * editdistance.h for a generalized edit distance mini-library.)
 *
 * To ensure this module always uses the minimum possible memory of one 64 KiB
 * Wasm page, "-sSTACK_SIZE=40960 -sINITIAL_MEMORY=65536 -sMALLOC=none" or
 * something similar should be passed as emcc flags. A STACK_SIZE of 40KiB is
 * about as large as possible given the page size and the ~21KiB required for
 * the module's statically allocated internal context.
 *
 * Use from JavaScript as follows:
 *
 *   0. Grab a pointer to a bidirectional buffer with edist_get_input_ptr().
 *
 *   1. Before running each query, call edist_reset() to clear the previous
 *      search space. Then, for each locale in the new search space:
 *
 *        a. Pack the locale tag and display name into the buffer as a raw
 *           u16le array, without null terminators and without separators.
 *
 *           As a contrived example, for "ab-AB" and "🖖 (D)":
 *
 *             61 00 62 00 2d 00 41 00 42 00 3d d8 96 dd 20 00 28 00 44 00 29 00
 *               a  |  b  |  -  |  A  |  B  |     🖖    |space|  (  |  D  |  )
 *
 *           Note that "🖖" has Unicode code point 0x1f596 and is represented
 *           by a surrogate pair of two UTF-16 code units, 0xd83d and 0xdd96.
 *           (No locale actually contains any surrogate pairs in its tag or
 *           display name, but query strings might, so just roll with it.)
 *
 *        b. Call edist_load_locale() with the lengths of both strings. Length
 *           is calculated in the same way as String.length from JavaScript as
 *           a count of UTF-16 code units without a null terminator.
 *
 *   2. To run a query:
 *        a. Pack the query string into the buffer as a u16le array per 1.a).
 *        b. Call edist_run_query() with the length of the string.
 *
 *   3. Read results from the buffer, which has now become an array of u8.
 *      These are the lesser of editdistance(query, locale_tag) and
 *      editdistance(query, locale_display_name) for each locale previously
 *      specified in 1), given in the same order as each locale was specified.
 *
 * Obviously, this isn't thread-safe. Arguably, it's not necessary. So what?
 */

#include <stdint.h>
#include <string.h>
#include <emscripten/emscripten.h>
#include "editdistance.h"

/*
 * Limits are set such that the reserved memory is sufficient to hold the
 * expected results of running foldUnicodeString() from src/shared/unicode.ts
 * on the locale tag or display name (e.g. "en-US"/"English (United States)").
 */

#define EDIST_MAX_BUF_SIZE        256
#define EDIST_MAX_LOCALES         200
#define EDIST_MAX_TAG_CODE_UNITS  12
#define EDIST_MAX_NAME_CODE_UNITS 40
#define EDIST_MAX_CODE_UNITS      EDIST_MAX_NAME_CODE_UNITS

/**
 * User locale.
 * @note See src/shared/locales.ts for known locale tags and display names.
 *  No such locale tag/name contains surrogate pairs.
 */
typedef struct user_locale_t {
  uint16_t tag[EDIST_MAX_TAG_CODE_UNITS];   /** BCP47-like locale tag. */
  uint16_t name[EDIST_MAX_NAME_CODE_UNITS]; /** Locale display name. */
  uint8_t tag_len;                          /** Tag length. */
  uint8_t name_len;                         /** Display name length. */
} user_locale_t;

/** Edit distance module context. */
typedef struct edist_ctx_t {
  uint8_t buf[EDIST_MAX_BUF_SIZE];          /** Bidirectional static buffer. */
  user_locale_t locales[EDIST_MAX_LOCALES]; /** Locale tags/display names. */
  uint8_t idxs[EDIST_MAX_CODE_UNITS];       /** Static index map for locales. */
  uint8_t count;                            /** Count of locales and idxs. */
} edist_ctx_t;

edist_ctx_t edist_ctx = {};

static uint8_t edist_has_script_subtag(uint8_t *buf, uint8_t tag_len) {
  uint8_t hyphens = 0;
  for (uint8_t i = 0; i < tag_len; i++)
    hyphens += buf[2 * i] == '-' && buf[2 * i + 1] == '\0';
  return hyphens > 1;
}

/**
 * Get a pointer to a bidirectional buffer.
 *
 * This buffer will be used to pass data between the edit distance module and
 * JavaScript.
 *
 * @return Pointer to a buffer.
 */
EMSCRIPTEN_KEEPALIVE uint8_t *edist_get_buf_ptr() {
  /*
   * On first run, build an index map for a string with no surrogate pairs.
   * The result is reusable for every locale's tag and display name.
   */
  if (!edist_ctx.idxs[0])
    for (uint8_t i = 0; i < EDIST_MAX_CODE_UNITS; i++)
      edist_ctx.idxs[i] = i + 1;

  return edist_ctx.buf;
}

/** Reset the edit distance module. */
EMSCRIPTEN_KEEPALIVE void edist_reset() {
  edist_ctx.count = 0;
}

/**
 * Load a user locale into the edit distance module context.
 *
 * Should be called after packing the locale tag and display name into the
 * bidirectional buffer as raw u16le arrays, without null terminators and
 * without separators.
 *
 * @param tag_len Tag length.
 * @param name_len Display name length.
 */
EMSCRIPTEN_KEEPALIVE void edist_load_locale(uint8_t tag_len, uint8_t name_len) {
  user_locale_t *locale = &edist_ctx.locales[edist_ctx.count++];
  uint8_t offset = tag_len * sizeof(*locale->tag);
  uint8_t *buf = edist_ctx.buf;

  if (edist_has_script_subtag(buf, tag_len)) {
    memcpy(locale->tag, buf, tag_len * sizeof(*locale->tag));
  } else {
    /*
     * Locale tags without script subtags (e.g. az-AZ) can have problematically
     * lower edit distances compared to those that do (e.g. az-Cyrl-AZ).
     * Insert the fake subtag "\x00\x00\x00\x00-".
     */
    uint16_t *tag = locale->tag;
    for (uint8_t i = 0; i < tag_len; i++) {
      uint16_t lo = buf[2 * i];
      uint16_t hi = buf[2 * i + 1];
      *tag++ = (hi << 8) | lo;
      if (lo == '-' && hi == '\0') {
        for (uint8_t j = 0; j < 4; j++)
          *tag++ = (uint16_t)'\0';
        *tag++ = '-';
      }
    }
    tag_len += 5;
  }
  memcpy(locale->name, &buf[offset], name_len * sizeof(*locale->name));

  locale->tag_len = tag_len;
  locale->name_len = name_len;
}

/**
 * Run an edit distance query.
 *
 * Should be called after packing a query string into the bidirectional buffer
 * as a u16le array. Results are returned in the same buffer as a u8 array,
 * each element being the lesser of editdistance(query, locale_tag) and
 * editdistance(query, locale_display_name) for each locale that has been
 * loaded into the edit distance module context.
 *
 * @param len Query string length.
 */
EMSCRIPTEN_KEEPALIVE void edist_run_query(uint8_t len) {
  uint16_t query[EDIST_MAX_CODE_UNITS];
  uint8_t query_idxs[EDIST_MAX_CODE_UNITS];
  uint8_t query_len;

  memcpy(query, edist_ctx.buf, len * sizeof(*query));
  query_len = edist_make_idxs(query, len, query_idxs);

  uint8_t *idxs = edist_ctx.idxs;

  for (int i = 0; i < edist_ctx.count; i++) {
    user_locale_t *locale = &edist_ctx.locales[i];
    uint8_t tag_score = edist_calc(query, query_idxs, query_len, locale->tag,
                                   idxs, locale->tag_len);
    uint8_t name_score = edist_calc(query, query_idxs, query_len, locale->name,
                                    idxs, locale->name_len);
    edist_ctx.buf[i] = edist_min(tag_score, name_score);
  }
}
