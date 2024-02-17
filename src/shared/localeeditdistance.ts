import EventBus from "@shared/eventbus";
import { EditDistanceReadyEvent } from "@shared/events";
import {
  knownLocales,
  sortLocales,
  supportedLocales,
  supportedScripts,
} from "@shared/locales";
import { findScriptsInString, foldUnicodeString } from "@shared/strings";

import createEditDistanceModule from "../../wasm/editdistance.js";

interface EditDistanceModule extends EmscriptenModule {
  _edist_get_buf_ptr(): number;
  _edist_reset(): void;
  _edist_load_locale(nameLen: number, descLen: number): void;
  _edist_run_query(len: number): number;
}

/* eslint-disable no-control-regex */
const kAsciiUnwantedRe = /[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]/g;

const kFoldedLocales = Object.fromEntries(
  supportedLocales.map((tag) => {
    const desc = knownLocales[tag][0];
    const foldedStrings = [tag, desc].map(foldUnicodeString);
    return [tag, foldedStrings];
  }),
);

function filterCandLocalesExact(candLocales: string[], foldedQuery: string) {
  return candLocales.filter((tag) => {
    const [foldedTag, foldedName] = kFoldedLocales[tag];
    return foldedTag.includes(foldedQuery) || foldedName.includes(foldedQuery);
  });
}

function findCandLocales(query: string, foldedQuery: string): string[] {
  /* No results for ASCII garbage and whitespace ([^0-9A-Za-z] && < 0x80). */
  const cleanedQuery = query.replaceAll(kAsciiUnwantedRe, "");
  if (cleanedQuery.length === 0) return [];

  const exactMatches = filterCandLocalesExact(supportedLocales, foldedQuery);
  if (exactMatches.length > 0) return exactMatches;

  const scripts = findScriptsInString(query);
  if (scripts.length === 0) return [];

  let minLocaleCount = Infinity;
  scripts.forEach((script) => {
    const scriptLocales = supportedScripts[script]!;
    minLocaleCount = Math.min(minLocaleCount, scriptLocales.length);
  });

  const candLocaleSet = new Set<string>();
  scripts.forEach((script) => {
    const scriptLocales = supportedScripts[script]!;
    if (scriptLocales.length === minLocaleCount)
      scriptLocales.forEach((tag) => candLocaleSet.add(tag));
  });

  return [...candLocaleSet];
}

function stringToBuf(str: string) {
  const u16Array = new Uint16Array(str.length);
  for (let i = 0; i < str.length; i++) u16Array[i] = str.charCodeAt(i);
  return u16Array.buffer;
}

class LocaleEditDistance {
  static #instance: LocaleEditDistance;

  #module!: EditDistanceModule;

  #buf!: number;

  constructor() {
    if (LocaleEditDistance.#instance != null)
      throw new Error("LocaleEditDistance is a singleton class.");
    createEditDistanceModule().then(this.#init);
    LocaleEditDistance.#instance = this;
  }

  #init = (module: EditDistanceModule) => {
    this.#module = module;
    this.#buf = module._edist_get_buf_ptr();
    EventBus.publish(EditDistanceReadyEvent);
  };

  #packBuf(...buffers: ArrayBuffer[]) {
    let offset = 0;
    buffers.forEach((buffer) => {
      this.#module.HEAPU8.set(new Uint8Array(buffer), this.#buf + offset);
      offset += buffer.byteLength;
    });
    return offset;
  }

  runQuery(query: string) {
    const trimmedQuery = query.trim();
    const foldedQuery = foldUnicodeString(trimmedQuery);
    const candLocales = findCandLocales(trimmedQuery, foldedQuery);
    const count = candLocales.length;

    if (count === 0) return undefined;

    this.#module._edist_reset();
    candLocales.forEach((locale) => {
      const [tag, name] = kFoldedLocales[locale];
      this.#packBuf(stringToBuf(tag), stringToBuf(name));
      this.#module._edist_load_locale(tag.length, name.length);
    });

    const buffer = stringToBuf(foldedQuery);
    this.#packBuf(buffer);
    this.#module._edist_run_query(foldedQuery.length);

    const queryResult = this.#module.HEAPU8.slice(this.#buf, this.#buf + count);
    const scoreMap = Object.fromEntries(
      candLocales.map((name, i) => [name, queryResult[i]]),
    );

    return candLocales.sort((a, b) =>
      scoreMap[a] < scoreMap[b] ? -1
      : scoreMap[a] > scoreMap[b] ? 1
      : sortLocales(a, b),
    );
  }
}

export default new LocaleEditDistance();
