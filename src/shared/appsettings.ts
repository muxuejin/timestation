import { defaultLocale, supportedLocales } from "./locales";

const kSupportedLocales = new Set(supportedLocales);

const kHasLocalStorage = (() => {
  /* cf. https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API */
  let storage: Storage | undefined;
  try {
    storage = window.localStorage;
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        e.name === "QuotaExceededError") &&
      storage != null &&
      storage.length !== 0
    );
  }
  return true;
})();

const kStations = ["BPC", "DCF77", "JJY", "MSF", "WWVB"] as const;
export type Station = (typeof kStations)[number];
export const stations: readonly Station[] = [...kStations] as const;

const kJjyKhz = [40, 60] as const;
export type JjyKhz = (typeof kJjyKhz)[number];
export const jjyKhz: readonly JjyKhz[] = [...kJjyKhz] as const;

const kValidators = {
  station: (x: any) => stations.includes(x),
  locale: (x: any) => kSupportedLocales.has(x),
  jjyKhz: (x: any) => jjyKhz.includes(x),
  offset: (x: any) => Number.isSafeInteger(x) && x > -86400000 && x < 86400000,
  dut1: (x: any) => Number.isSafeInteger(x) && x > -1000 && x < 1000,
  noclip: (x: any) => typeof x === "boolean",
  dark: (x: any) => typeof x === "boolean",
} as const;
export type AppSetting = keyof typeof kValidators;
export type AppSettings = {
  station: Station;
  locale: string;
  jjyKhz: JjyKhz;
  offset: number;
  dut1: number;
  noclip: boolean;
  dark: boolean;
};

const kDefaultAppSettings: AppSettings = {
  station: "WWVB",
  locale: defaultLocale,
  jjyKhz: 40,
  offset: 0,
  dut1: 0,
  noclip: true,
  dark: window.matchMedia?.("(prefers-color-scheme: dark").matches ?? false,
} as const;

const appSettings: AppSettings = { ...kDefaultAppSettings };

function convertStoredValue<T extends AppSetting>(
  setting: T,
  value?: string,
): AppSettings[T] | undefined {
  let converted: any;
  if (value != null) {
    if (setting === "station" || setting === "locale") {
      converted = value;
    } else if (setting === "noclip" || setting === "dark") {
      if (value === "true" || value === "false") converted = value === "true";
    } else {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed) && Number.isSafeInteger(parsed))
        converted = parsed;
    }
  }
  return converted != null ? (converted as AppSettings[T]) : undefined;
}

function isValueValid(setting: AppSetting, value: any) {
  return kValidators[setting](value);
}

function isStoredValueValid<T extends AppSetting>(setting: T, value?: string) {
  const convertedValue = convertStoredValue(setting, value);
  return convertedValue != null && isValueValid(setting, convertedValue);
}

export function setAppSetting<T extends AppSetting>(
  setting: T,
  value: AppSettings[T],
) {
  if (!isValueValid(setting, value))
    throw new Error(`"${value}" is an invalid ${setting}`);
  if (kHasLocalStorage) window.localStorage.setItem(setting, `${value}`);
  appSettings[setting] = value;
}

export function getAppSetting<T extends AppSetting>(
  setting: T,
): AppSettings[T] {
  const value = appSettings[setting];
  const isValid = isValueValid(setting, value);

  if (kHasLocalStorage) {
    const storedValue = window.localStorage.getItem(setting) ?? undefined;
    const isStoredValid = isStoredValueValid(setting, storedValue);

    if (isStoredValid) {
      appSettings[setting] = convertStoredValue(setting, storedValue)!;
    } else if (isValid) {
      setAppSetting(setting, value);
    } else {
      appSettings[setting] = kDefaultAppSettings[setting];
      setAppSetting(setting, appSettings[setting]);
    }
  } else if (!isValid) {
    appSettings[setting] = kDefaultAppSettings[setting];
  }

  return appSettings[setting];
}

export function resetAppSettings() {
  setAppSetting("station", kDefaultAppSettings.station);
  setAppSetting("locale", kDefaultAppSettings.locale);
  setAppSetting("jjyKhz", kDefaultAppSettings.jjyKhz);
  setAppSetting("offset", kDefaultAppSettings.offset);
  setAppSetting("dut1", kDefaultAppSettings.dut1);
  setAppSetting("noclip", kDefaultAppSettings.noclip);
  setAppSetting("dark", kDefaultAppSettings.dark);
}
