import caseFoldingMap from "./casefoldingmap";

const kDiacritics = /[\u{0300}-\u{036f}]/gu;
const kScriptRangeMap = {
  arabic: /[\u{0600}-\u{06ff}]/u,
  armenian: /[\u{0530}-\u{058f}]/u,
  bengali: /[\u{0981}-\u{09fb}]/u,
  burmese: /[\u{1000}-\u{109f}]/u,
  cjk: /[\u{3300}-\u{33ff}\u{2f00}-\u{2fdf}\u{fe30}-\u{fe4f}\u{f900}-\u{faff}\u{2f800}-\u{2fa1f}\u{2e80}-\u{2eff}\u{3000}-\u{303f}\u{31c0}-\u{31ef}\u{4e00}-\u{9fff}\u{20000}-\u{2a6d6}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{3200}-\u{32ff}\u{2ff0}-\u{2fff}\u{3400}-\u{4dbf}]/u,
  cyrillic:
    /[\u{0400}-\u{04ff}\u{0500}-\u{052f}]|[\u{2de0}-\u{2dff}\u{a640}-\u{a69f}]/u,
  devanagari: /[\u{0901}-\u{097f}]/u,
  ethiopic: /[\u{1200}-\u{1399}]/u,
  georgian: /[\u{10a0}-\u{10ff}]/u,
  greekAndCoptic: /[\u{0370}-\u{03ff}\u{1f00}-\u{1fff}]/u,
  gujarati: /[\u{0a81}-\u{0af1}]/u,
  gurmukhi: /[\u{0a00}-\u{0a7f}]/u,
  hangul:
    /[\u{ac00}-\u{d7a3}\u{1100}-\u{11ff}\u{3130}-\u{318f}\u{a960}-\u{a97f}\u{d7b0}-\u{d7ff}]/u,
  hebrew: /[\u{0590}-\u{05ff}]/u,
  hiragana: /[\u{3040}-\u{309f}]/u,
  kannada: /[\u{0c82}-\u{0cf2}]/u,
  katakana: /[\u{30a0}-\u{30ff}\u{31f0}-\u{31ff}]/u,
  khmer: /[\u{1780}-\u{17ff}\u{19e0}-\u{19ff}]/u,
  lao: /[\u{0e81}-\u{0edf}]/u,
  latin: /[A-Za-z]/u,
  latin1Sup: /[\x80-\xff]/u,
  latinExtA: /[\u{0100}-\u{017f}]/u,
  latinExtB: /[\u{0180}-\u{024f}]/u,
  malayalam: /[\u{0d02}-\u{0d7f}]/u,
  mongolian: /[\u{1800}-\u{18aa}]/u,
  orientalMisc:
    /[\u{3105}-\u{312c}\u{31a0}-\u{31bf}\u{3190}-\u{319f}\u{4dc0}-\u{4dff}]/u,
  oriya: /[\u{0b01}-\u{0b77}]/u,
  sinhala: /[\u{0d82}-\u{0df4}]/u,
  tamil: /[\u{0b82}-\u{0bfa}]/u,
  telugu: /[\u{0c01}-\u{0c7f}]/u,
  thai: /[\u{0e01}-\u{0e5b}]/u,
  tibetan: /[\u{0f00}-\u{0fda}]/u,
  vietnamese: /[\u{1ea0}-\u{1ef9}]/u,
  yi: /[\u{a000}-\u{a4cf}]/u,
} as const;

export type UnicodeScript = keyof typeof kScriptRangeMap;

/**
 * Case-fold, normalize, and remove diacritics from a string according to
 * relevant Unicode rules.
 *
 * This (usually) allows locale- and case-insensitive string comparisons.
 *
 * @see The Unicode Standard, Version 15.0, §3.13
 * @see The Unicode Standard, Version 15.0, UAX #15
 * @param str - The string to case-fold and normalize.
 * @returns The processed string, with cases folded and diacritics removed.
 */
export function foldUnicodeString(str: string) {
  const folded = [...str].reduce((acc, codePoint) => {
    const mapping = caseFoldingMap[codePoint] ?? codePoint;
    return acc + mapping;
  }, "");
  const normalized = folded.normalize("NFD");
  return normalized.replaceAll(kDiacritics, "");
}

export function findScriptsInString(str: string) {
  const scripts = Object.keys(kScriptRangeMap) as UnicodeScript[];
  return scripts.filter((script) => kScriptRangeMap[script].test(str));
}
