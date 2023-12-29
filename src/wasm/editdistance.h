/**
 * Mini-library for computing the edit distance between two UTF-16 strings.
 *
 * The unit of difference is a Unicode code point, which is not always the
 * same as a UTF-16 code unit.
 *
 * Both strings must contain < 256 UTF-16 code units. This limitation exists
 * only to ensure that edist_calc() never needs to dynamically allocate memory
 * and could be easily removed.
 */

#pragma once

#include <stdint.h>

#define EDIST_UTF16_MIN_SURROGATE 0xd800
#define EDIST_UTF16_MAX_SURROGATE 0xdfff

static inline int edist_min(int a, int b) {
  return a < b ? a : b;
}

static inline int edist_max(int a, int b) {
  return a > b ? a : b;
}

static inline uint8_t edist_is_surrogate(uint16_t code_unit) {
  return EDIST_UTF16_MIN_SURROGATE <= code_unit &&
         code_unit <= EDIST_UTF16_MAX_SURROGATE;
}

static inline uint8_t edist_is_surrogate_pair(uint8_t idxs[], uint8_t i) {
  return idxs[i] > (i ? idxs[i - 1] : 0) + 1;
}

static uint8_t edist_utf16_eq(uint16_t s1[], uint8_t idxs1[], uint8_t i,
                              uint16_t s2[], uint8_t idxs2[], uint8_t j) {
  uint8_t is_pair = edist_is_surrogate_pair(idxs1, i);
  if (is_pair != edist_is_surrogate_pair(idxs2, j))
    return 0;

  uint8_t k1 = idxs1[i] - 1 - is_pair;
  uint8_t k2 = idxs2[j] - 1 - is_pair;
  uint8_t is_first_eq = s1[k1] == s2[k2];
  if (!is_pair || !is_first_eq)
    return is_first_eq;

  return s1[k1 + 1] == s2[k2 + 1];
}

static void edist_utf16_swap_first_two(uint16_t s[], uint8_t idxs[]) {
  uint8_t code_units = idxs[1];
  for (uint8_t rotate = idxs[1] - idxs[0]; rotate; rotate--) {
    uint16_t right = s[code_units - 1];
    for (uint8_t i = code_units - 1; i; i--)
      s[i] = s[i - 1];
    s[0] = right;
  }
  uint8_t tmp = idxs[0];
  idxs[0] = idxs[1] - idxs[0];
  idxs[1] = idxs[0] + tmp;
}

static uint8_t edist_calc_le2(uint16_t s1[], uint8_t idxs1[], uint8_t len1,
                              uint16_t s2[], uint8_t idxs2[], uint8_t len2) {
  uint8_t found_second = 0;
  uint8_t found_first = 0;
  uint8_t first = 0;

  for (uint8_t i = 0; i < len1 && !found_first; i++) {
    if (edist_utf16_eq(s1, idxs1, i, s2, idxs2, 0)) {
      found_first = 1;
      first = i;
    }
  }

  if (len2 == 1)
    return len1 - found_first;

  if (found_first && first == len1 - 1) {
    found_first = 0;
    first = 0;
  }

  for (uint8_t i = first + 1; i < len1 && !found_second; i++)
    found_second = edist_utf16_eq(s1, idxs1, i, s2, idxs2, 1);

  return len1 - found_first - found_second;
}

/**
 * Compute edit distance between two UTF-16 strings.
 *
 * Wagner-Fischer (detects adjacent transposition) with memory reduction and
 * branch pruning.
 *
 * cf. https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
 * cf. https://ceptord.net/wagner-fischer/index.html
 *
 * @param s1 UTF-16 code units in the first string. Not null terminated.
 * @param idxs1 Index map for `s1`.
 * @param len1 Length of the first string in Unicode code points.
 * @param s2 UTF-16 code units in the second string Not null terminated.
 * @param idxs2 Index map for `s2`.
 * @param len2 Length of the second string in Unicode code points.
 * @return Edit distance between the strings.
 */
uint8_t edist_calc(uint16_t s1[], uint8_t idxs1[], uint8_t len1,
                   uint16_t s2[], uint8_t idxs2[], uint8_t len2) {
  if (len1 < len2)
    return edist_calc(s2, idxs2, len2, s1, idxs1, len1);

  if (!len2)
    return len1;

  if (len2 == 1)
    return edist_calc_le2(s1, idxs1, len1, s2, idxs2, len2);

  if (len2 == 2) {
    edist_utf16_swap_first_two(s2, idxs2);
    uint8_t cand = edist_calc_le2(s1, idxs1, len1, s2, idxs2, len2);
    edist_utf16_swap_first_two(s2, idxs2);
    return edist_min(cand, edist_calc_le2(s1, idxs1, len1, s2, idxs2, len2));
  }

  uint8_t buf_len = edist_max(len1, len2) + 1;

  uint8_t actual_buf0[buf_len];
  uint8_t actual_buf1[buf_len];
  uint8_t actual_buf2[buf_len];

  uint8_t *buf0 = actual_buf0;
  uint8_t *buf1 = actual_buf1;
  uint8_t *buf2 = actual_buf2;

  uint8_t rlimit = (len2 - 1) / 2;
  int16_t llimit = len2 - len1 - rlimit + 1;

  for (uint8_t i = 0; i <= rlimit; i++)
    buf0[i] = i;

  for (uint8_t i = 1; i <= len1; i++) {
    uint8_t *tmp = buf2;
    buf2 = buf1;
    buf1 = buf0;
    buf0 = tmp;

    buf0[0] = i;

    uint8_t l = edist_max(llimit++, 1);
    uint8_t r = edist_min(rlimit++, len2);

    uint8_t up_left = buf1[l - 1];
    uint8_t up = buf1[l];

    if (!edist_utf16_eq(s1, idxs1, i - 1, s2, idxs2, l - 1))
      up_left = edist_min(up_left, up) + 1;

    uint8_t left = up_left;
    buf0[l] = up_left;
    up_left = up;

    if (i > 1 && l > 1 && edist_utf16_eq(s1, idxs1, i - 1, s2, idxs2, l - 2)
                       && edist_utf16_eq(s1, idxs1, i - 2, s2, idxs2, l - 1))
      buf0[l] = edist_min(buf0[l], buf2[l - 2] + 1);

    for (uint8_t j = l + 1; j <= r; j++) {
      up = buf1[j];

      if (!edist_utf16_eq(s1, idxs1, i - 1, s2, idxs2, j - 1))
        up_left = edist_min(edist_min(up_left, up), left) + 1;

      left = up_left;
      buf0[j] = up_left;
      up_left = up;

      if (i > 1 && j > 1 && edist_utf16_eq(s1, idxs1, i - 1, s2, idxs2, j - 2)
                         && edist_utf16_eq(s1, idxs1, i - 2, s2, idxs2, j - 1))
        buf0[j] = edist_min(buf0[j], buf2[j - 2] + 1);
    }

    if (r == len2)
      continue;

    if (!edist_utf16_eq(s1, idxs1, i - 1, s2, idxs2, r))
      up_left = edist_min(up_left, left) + 1;

    buf0[r + 1] = up_left;

    if (i > 1 && r > 0 && edist_utf16_eq(s1, idxs1, i - 1, s2, idxs2, r - 1)
                       && edist_utf16_eq(s1, idxs1, i - 2, s2, idxs2, r))
      buf0[r + 1] = edist_min(buf0[r + 1], buf2[r - 1] + 1);
  }

  return buf0[len2];
}

/**
 * Create an index map for a UTF-16 string.
 * @param s UTF-16 code units in the string.
 * @param code_units Count of code units. Must be < 256.
 * @param[out] out_idxs Computed index map relating Unicode code points in the
 *  string to their corresponding ending indices in `s`.
 * @return Length of the string in code points.
 * @note A surrogate pair takes up 2 code units in `s`
 *  but contributes 1 code point to the return value.
 */
uint8_t edist_make_idxs(uint16_t s[], uint8_t code_units, uint8_t out_idxs[]) {
  uint8_t len = 0;
  for (uint8_t i = 0, j = 0; i < code_units; i = j, len++) {
    if (edist_is_surrogate(s[j++]))
      j += j < code_units && edist_is_surrogate(s[j]);
    out_idxs[len] = j;
  }
  return len;
}