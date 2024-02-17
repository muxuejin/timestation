import {
  UnicodeScript,
  findScriptsInString,
  foldUnicodeString,
} from "@shared/strings";

type LocaleData = [description: string, amMarker: string, pmMarker: string];

const kFallbackDefaultLocale = "en-US";

export const knownLocales: Record<string, LocaleData> = {
  "af-ZA": ["Afrikaans (Suid-Afrika)", "", ""],
  "am-ET": ["አማርኛ (ኢትዮጵያ)", "ጥዋት", "ከሰዓት"],
  "ar-AE": ["العربية (الإمارات العربية المتحدة)", "ص", "م"],
  "ar-BH": ["العربية (البحرين)", "ص", "م"],
  "ar-DZ": ["العربية (الجزائر)", "ص", "م"],
  "ar-EG": ["العربية (مصر)", "ص", "م"],
  "ar-IQ": ["العربية (العراق)", "ص", "م"],
  "ar-JO": ["العربية (الأردن)", "ص", "م"],
  "ar-KW": ["العربية (الكويت)", "ص", "م"],
  "ar-LB": ["العربية (لبنان)", "ص", "م"],
  "ar-LY": ["العربية (ليبيا)", "ص", "م"],
  "ar-MA": ["العربية (المغرب)", "", ""],
  "ar-OM": ["العربية (عُمان)", "ص", "م"],
  "ar-QA": ["العربية (قطر)", "ص", "م"],
  "ar-SA": ["العربية (المملكة العربية السعودية)", "ص", "م"],
  "ar-SD": ["العربية (السودان)", "ص", "م"],
  "ar-SY": ["العربية (سوريا)", "ص", "م"],
  "ar-TN": ["العربية (تونس)", "ص", "م"],
  "ar-YE": ["العربية (اليمن)", "ص", "م"],
  "as-IN": ["অসমীয়া (ভাৰত)", "পূৰ্বাহ্ন", "অপৰাহ্ন"],
  "az-AZ": ["Azərbaycanca (Azərbaycan)", "", ""],
  "az-Cyrl-AZ": ["Азәрбајҹанҹа (Кирил, Азәрбајҹан)", "", ""],
  "be-BY": ["Беларуская (Беларусь)", "", ""],
  "bg-BG": ["Български (България)", "", ""],
  "bn-BD": ["বাংলা (বাংলাদেশ)", "পূর্বাহ্ন", "অপরাহ্ন"],
  "bn-IN": ["বাংলা (ভারত)", "পূর্বাহ্ন", "অপরাহ্ন"],
  "bo-CN": ["བོད་སྐད་ (རྒྱ་ནག)", "", ""],
  "br-FR": ["Brezhoneg (Frañs)", "", ""],
  "bs-BA": ["Bosanski (Bosna i Hercegovina)", "", ""],
  "bs-Cyrl-BA": ["Босански (Ћирилица, Босна и Херцеговина)", "", ""],
  "ca-ES": ["Català (Espanya)", "", ""],
  "cs-CZ": ["Čeština (Česko)", "", ""],
  "cy-GB": ["Cymraeg (Y Deyrnas Unedig)", "", ""],
  "da-DK": ["Dansk (Danmark)", "", ""],
  "de-AT": ["Deutsch (Österreich)", "", ""],
  "de-CH": ["Deutsch (Schweiz)", "", ""],
  "de-DE": ["Deutsch (Deutschland)", "", ""],
  "de-LI": ["Deutsch (Liechtenstein)", "", ""],
  "de-LU": ["Deutsch (Luxemburg)", "", ""],
  "dsb-DE": ["Dolnoserbšćina (Nimska)", "", ""],
  "el-CY": ["Ελληνικά (Κύπρος)", "πμ", "μμ"],
  "el-GR": ["Ελληνικά (Ελλάδα)", "πμ", "μμ"],
  "en-029": ["English (Caribbean)", "AM", "PM"],
  "en-AU": ["English (Australia)", "am", "pm"],
  "en-BZ": ["English (Belize)", "", ""],
  "en-CA": ["English (Canada)", "am", "pm"],
  "en-GB": ["English (United Kingdom)", "", ""],
  "en-IE": ["English (Ireland)", "", ""],
  "en-IN": ["English (India)", "AM", "PM"],
  "en-JM": ["English (Jamaica)", "am", "pm"],
  "en-MT": ["English (Malta)", "", ""],
  "en-MY": ["English (Malaysia)", "am", "pm"],
  "en-NZ": ["English (New Zealand)", "am", "pm"],
  "en-PH": ["English (Philippines)", "AM", "PM"],
  "en-SG": ["English (Singapore)", "am", "pm"],
  "en-TT": ["English (Trinidad & Tobago)", "am", "pm"],
  "en-US": ["English (United States)", "AM", "PM"],
  "en-ZA": ["English (South Africa)", "", ""],
  "en-ZW": ["English (Zimbabwe)", "", ""],
  "es-AR": ["Español (Argentina)", "", ""],
  "es-BO": ["Español (Bolivia)", "", ""],
  "es-CL": ["Español (Chile)", "", ""],
  "es-CO": ["Español (Colombia)", "am", "pm"],
  "es-CR": ["Español (Costa Rica)", "", ""],
  "es-DO": ["Español (República Dominicana)", "am", "pm"],
  "es-EC": ["Español (Ecuador)", "", ""],
  "es-ES": ["Español (España)", "", ""],
  "es-GT": ["Español (Guatemala)", "", ""],
  "es-HN": ["Español (Honduras)", "", ""],
  "es-MX": ["Español (México)", "", ""],
  "es-NI": ["Español (Nicaragua)", "", ""],
  "es-PA": ["Español (Panamá)", "am", "pm"],
  "es-PE": ["Español (Perú)", "", ""],
  "es-PR": ["Español (Puerto Rico)", "am", "pm"],
  "es-PY": ["Español (Paraguay)", "", ""],
  "es-SV": ["Español (El Salvador)", "", ""],
  "es-US": ["Español (Estados Unidos)", "am", "pm"],
  "es-UY": ["Español (Uruguay)", "", ""],
  "es-VE": ["Español (Venezuela)", "am", "pm"],
  "et-EE": ["Eesti (Eesti)", "", ""],
  "eu-ES": ["Euskara (Espainia)", "", ""],
  "fa-AF": ["فارسی (افغانستان)", "", ""],
  "fa-IR": ["فارسی (ایران)", "", ""],
  "fi-FI": ["Suomi (Suomi)", "", ""],
  "fil-PH": ["Filipino (Pilipinas)", "AM", "PM"],
  "fo-FO": ["Føroyskt (Føroyar)", "", ""],
  "fr-BE": ["Français (Belgique)", "", ""],
  "fr-CA": ["Français (Canada)", "", ""],
  "fr-CH": ["Français (Suisse)", "", ""],
  "fr-FR": ["Français (France)", "", ""],
  "fr-LU": ["Français (Luxembourg)", "", ""],
  "fr-MC": ["Français (Monaco)", "", ""],
  "fy-NL": ["Frysk (Nederlân)", "", ""],
  "ga-IE": ["Gaeilge (Éire)", "", ""],
  "gd-GB": ["Gàidhlig (An Rìoghachd Aonaichte)", "", ""],
  "gd-IE": ["Gàidhlig (Èirinn)", "", ""],
  "gl-ES": ["Galego (España)", "", ""],
  "gsw-FR": ["Schwiizertüütsch (Frankriich)", "", ""],
  "gu-IN": ["ગુજરાતી (ભારત)", "સવાર", "સાંજ"],
  "ha-Latn-NG": ["Hausa (Latin, Nijeriya)", "", ""],
  "he-IL": ["עברית (ישראל)", "", ""],
  "hi-IN": ["हिन्दी (भारत)", "पूर्वाह्न", "अपराह्न"],
  "hr-BA": ["Hrvatski (Bosna i Hercegovina)", "", ""],
  "hr-HR": ["Hrvatski (Hrvatska)", "", ""],
  "hsb-DE": ["Hornjoserbšćina (Němska)", "", ""],
  "hu-HU": ["Magyar (Magyarország)", "", ""],
  "hy-AM": ["Հայերեն (Հայաստան)", "", ""],
  "id-ID": ["Indonesia (Indonesia)", "", ""],
  "ig-NG": ["Igbo (Naịjịrịa)", "", ""],
  "ii-CN": ["ꆈꌠꉙ (ꍏꇩ)", "", ""],
  "is-IS": ["Íslenska (Ísland)", "", ""],
  "it-CH": ["Italiano (Svizzera)", "", ""],
  "it-IT": ["Italiano (Italia)", "", ""],
  "ja-JP": ["日本語 (日本)", "", ""],
  "ka-GE": ["ქართული (საქართველო)", "", ""],
  "kk-KZ": ["Қазақша (Қазақстан)", "", ""],
  "kl-GL": ["Kalaallisut (Kalaallit Nunaat)", "", ""],
  "km-KH": ["ខ្មែរ (កម្ពុជា)", "ព្រឹក", "ល្ងាច"],
  "kn-IN": ["ಕನ್ನಡ (ಭಾರತ)", "ಬೆಳಗ್ಗೆ", "ಸಂಜೆ"],
  "ko-KR": ["한국어 (대한민국)", "오전", "오후"],
  "kok-IN": ["कोंकणी (भारत)", "सकाळ", "सांज"],
  "ky-KG": ["Кыргызча (Кыргызстан)", "", ""],
  "lb-LU": ["Lëtzebuergesch (Lëtzebuerg)", "", ""],
  "lo-LA": ["ລາວ (ລາວ)", "", ""],
  "lt-LT": ["Lietuvių (Lietuva)", "", ""],
  "lv-LV": ["Latviešu (Latvija)", "", ""],
  "mi-NZ": ["Māori (Aotearoa)", "ata", "pō"],
  "mk-MK": ["Македонски (Северна Македонија)", "", ""],
  "ml-IN": ["മലയാളം (ഇന്ത്യ)", "രാവിലെ", "രാത്രി"],
  "mn-MN": ["Монгол (Монгол)", "", ""],
  "mn-Mong-CN": ["Монгол (Монгол бичиг, Хятад)", "", ""],
  "mr-IN": ["मराठी (भारत)", "सकाळ", "रात्री"],
  "ms-BN": ["Melayu (Brunei)", "PG", "PTG"],
  "ms-MY": ["Melayu (Malaysia)", "PG", "PTG"],
  "mt-MT": ["Malti (Malta)", "", ""],
  "nb-NO": ["Norsk bokmål (Norge)", "", ""],
  "ne-NP": ["नेपाली (नेपाल)", "", ""],
  "nl-BE": ["Nederlands (België)", "", ""],
  "nl-NL": ["Nederlands (Nederland)", "", ""],
  "nn-NO": ["Norsk nynorsk (Noreg)", "", ""],
  "no-NO": ["Norsk (Norge)", "", ""],
  "or-IN": ["ଓଡ଼ିଆ (ଭାରତ)", "ପୂର୍ବାହ୍ନ", "ଅପରାହ୍ନ"],
  "pa-IN": ["ਪੰਜਾਬੀ (ਭਾਰਤ)", "ਸਵੇਰੇ", "ਸ਼ਾਮ"],
  "pl-PL": ["Polski (Polska)", "", ""],
  "ps-AF": ["پښتو (افغانستان)", "", ""],
  "pt-BR": ["Português (Brasil)", "", ""],
  "pt-PT": ["Português (Portugal)", "", ""],
  "qu-BO": ["Runasimi (Bolivia)", "", ""],
  "qu-EC": ["Runasimi (Ecuador)", "", ""],
  "qu-PE": ["Runasimi (Perú)", "", ""],
  "rm-CH": ["Rumantsch (Svizra)", "", ""],
  "ro-RO": ["Română (România)", "", ""],
  "ru-RU": ["Русский (Россия)", "", ""],
  "rw-RW": ["Ikinyarwanda (U Rwanda)", "", ""],
  "sa-IN": ["संस्कृत भाषा (भारतः)", "पूर्वाह्न", "अपराह्न"],
  "sah-RU": ["Саха тыла (Арассыыйа)", "", ""],
  "se-FI": ["Davvisámegiella (Suopma)", "", ""],
  "se-NO": ["Davvisámegiella (Norga)", "", ""],
  "se-SE": ["Davvisámegiella (Ruoŧŧa)", "", ""],
  "si-LK": ["සිංහල (ශ්‍රී ලංකාව)", "", ""],
  "sk-SK": ["Slovenčina (Slovensko)", "", ""],
  "sl-SI": ["Slovenščina (Slovenija)", "", ""],
  "smn-FI": ["Anarâškielâ (Suomâ)", "", ""],
  "sq-AL": ["Shqip (Shqipëri)", "PD", "MD"],
  "sr-Cyrl-BA": ["Српски (Ћирилица, Босна и Херцеговина)", "", ""],
  "sr-Cyrl-ME": ["Српски (Ћирилица, Црна Гора)", "", ""],
  "sr-Cyrl-RS": ["Српски (Ћирилица, Србија)", "", ""],
  "sr-Latn-BA": ["Srpski (Latinica, Bosna i Hercegovina)", "", ""],
  "sr-Latn-ME": ["Srpski (Latinica, Crna Gora)", "", ""],
  "sr-Latn-RS": ["Srpski (Latinica, Srbija)", "", ""],
  "sv-FI": ["Svenska (Finland)", "", ""],
  "sv-SE": ["Svenska (Sverige)", "", ""],
  "sw-KE": ["Kiswahili (Kenya)", "", ""],
  "ta-IN": ["தமிழ் (இந்தியா)", "காலை", "மாலை"],
  "te-IN": ["తెలుగు (భారతదేశం)", "ఉదయం", "సాయంత్రం"],
  "tg-TJ": ["Тоҷикӣ (Тоҷикистон)", "", ""],
  "th-TH": ["ไทย (ไทย)", "", ""],
  "tk-TM": ["Türkmençe (Türkmenistan)", "", ""],
  "tr-TR": ["Türkçe (Türkiye)", "", ""],
  "tt-RU": ["Татар (Россия)", "", ""],
  "tzm-DZ": ["Tamaziɣt n laṭlaṣ (Dzayer)", "", ""],
  "ug-CN": ["ئۇيغۇرچە (جۇڭگو)", "", ""],
  "uk-UA": ["Українська (Україна)", "", ""],
  "ur-PK": ["اردو (پاکستان)", "صبح", "شام"],
  "uz-Cyrl-UZ": ["Ўзбекча (Кирил, Ўзбекистон)", "", ""],
  "uz-UZ": ["Oʻzbekcha (Oʻzbekiston)", "", ""],
  "vi-VN": ["Tiếng Việt (Việt Nam)", "", ""],
  "wo-SN": ["Wolof (Senegaal)", "", ""],
  "xh-ZA": ["isiXhosa (uMzantsi Afrika)", "", ""],
  "yo-NG": ["Èdè Yorùbá (Nàìjíríà)", "", ""],
  "zh-CN": ["中文（中国）", "", ""],
  "zh-HK": ["中文（香港）", "上午", "下午"],
  "zh-MO": ["中文（澳門）", "上午", "下午"],
  "zh-SG": ["中文（新加坡）", "上午", "下午"],
  "zh-TW": ["中文（台灣）", "上午", "下午"],
  "zu-ZA": ["isiZulu (iNingizimu Afrika)", "", ""],
};

export const maxLocaleTagCodeUnits = 12 as const;

export const maxLocaleNameCodeUnits = 40 as const;

export const defaultLocale = (() => {
  const { locale } = new Intl.DateTimeFormat().resolvedOptions();
  if (knownLocales[locale] != null) return locale;

  if (foldUnicodeString(locale).length > maxLocaleTagCodeUnits)
    return kFallbackDefaultLocale;

  const name = new Intl.DisplayNames([locale], {
    type: "language",
  }).of(locale);
  if (name == null || foldUnicodeString(name).length > maxLocaleNameCodeUnits)
    return kFallbackDefaultLocale;

  knownLocales[locale] = [name, "", ""]; /* Assume h23. */

  return locale;
})();

export const supportedLocales: string[] = [];

export const supportedScripts: Partial<Record<UnicodeScript, string[]>> = {};

export function sortLocales(a: string, b: string) {
  /* eslint-disable prefer-const */
  let [aLanguage, aScript, aRegion] = a.split("-");
  let [bLanguage, bScript, bRegion] = b.split("-");
  if (aRegion == null) [aScript, aRegion] = ["", aScript];
  if (bRegion == null) [bScript, bRegion] = ["", bScript];
  return (
    aLanguage < bLanguage ? -1
    : aLanguage > bLanguage ? 1
    : aRegion < bRegion ? -1
    : aRegion > bRegion ? 1
    : aScript < bScript ? -1
    : aScript > bScript ? 1
    : 0
  );
}

(() => {
  const knownTags = Object.keys(knownLocales);
  const tags = Intl.DateTimeFormat.supportedLocalesOf(knownTags);

  tags.sort(sortLocales).forEach((locale) => {
    const description = knownLocales[locale][0];
    const scripts = findScriptsInString(description);
    scripts.forEach((script) => {
      if (supportedScripts[script] == null) supportedScripts[script] = [];
      supportedScripts[script]!.push(locale);
    });
    supportedLocales.push(locale);
  });

  if (supportedLocales.includes("ja-JP")) {
    const jaJp = ["ja-JP"];
    supportedScripts.hiragana = jaJp;
    supportedScripts.katakana = jaJp;
  }
})();
