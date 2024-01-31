import { defaultLocale, supportedLocales } from "./locales";

const kSupportedLocales = new Set(supportedLocales);

const kStations = ["BPC", "DCF77", "JJY", "MSF", "WWVB"] as const;
export type Station = (typeof kStations)[number];
export const stations: readonly Station[] = [...kStations] as const;

const kJjyKhz = [40, 60] as const;
export type JjyKhz = (typeof kJjyKhz)[number];
export const jjyKhz: readonly JjyKhz[] = [...kJjyKhz] as const;

const kAppSettings = [
  "station",
  "locale",
  "jjyKhz",
  "offset",
  "dut1",
  "noclip",
  "sync",
  "dark",
] as const;
export type AppSetting = (typeof kAppSettings)[number];
export const appSettings: readonly AppSetting[] = [...kAppSettings] as const;

const kValidators: Record<AppSetting, (x: any) => boolean> = {
  station: (x: any) => stations.includes(x),
  locale: (x: any) => kSupportedLocales.has(x),
  jjyKhz: (x: any) => jjyKhz.includes(x),
  offset: (x: any) => Number.isSafeInteger(x) && x > -86400000 && x < 86400000,
  dut1: (x: any) => Number.isSafeInteger(x) && x > -1000 && x < 1000,
  noclip: (x: any) => typeof x === "boolean",
  sync: (x: any) => typeof x === "boolean",
  dark: (x: any) => typeof x === "boolean",
} as const;

type AppSettingType = {
  station: Station;
  locale: string;
  jjyKhz: JjyKhz;
  offset: number;
  dut1: number;
  noclip: boolean;
  sync: boolean;
  dark: boolean;
};
const kDefaultAppSettings: AppSettingType = {
  station: "WWVB",
  locale: defaultLocale,
  jjyKhz: 40,
  offset: 0,
  dut1: 0,
  noclip: true,
  sync: true,
  dark: window.matchMedia?.("(prefers-color-scheme: dark").matches ?? false,
} as const;

function convertStoredValue<T extends AppSetting>(
  setting: T,
  value?: string,
): AppSettingType[T] | undefined {
  let converted: any;
  if (value != null) {
    if (setting === "station" || setting === "locale") {
      converted = value;
    } else if (
      (setting === "noclip" || setting === "sync" || setting === "dark") &&
      (value === "true" || value === "false")
    ) {
      converted = value === "true";
    } else {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed) && Number.isSafeInteger(parsed))
        converted = parsed;
    }
  }
  return converted != null ? (converted as AppSettingType[T]) : undefined;
}

function isValueValid(setting: AppSetting, value: any) {
  return kValidators[setting](value);
}

function hasLocalStorage() {
  /* cf. https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API */
  let storage: Storage | undefined;
  try {
    storage = window.localStorage;
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        e.name === "QuotaExceededError") &&
      storage != null &&
      storage.length !== 0
    );
  }
}

class AppSettings {
  static #instance: AppSettings;

  #settings: AppSettingType;

  #hasLocalStorage = hasLocalStorage();

  constructor() {
    if (AppSettings.#instance != null)
      throw new Error("AppSettings is a singleton class.");
    AppSettings.#instance = this;

    if (this.#hasLocalStorage)
      this.#settings = Object.fromEntries(
        Object.entries(kDefaultAppSettings).map(([name, defaultValue]) => {
          const setting = name as AppSetting;
          const storedValue = window.localStorage.getItem(setting) ?? undefined;
          const value = convertStoredValue(setting, storedValue);
          const isValid = value != null && isValueValid(setting, value);
          return [setting, isValid ? value : defaultValue];
        }),
      ) as AppSettingType;
    else this.#settings = { ...kDefaultAppSettings };
  }

  set<T extends AppSetting>(setting: T, value: AppSettingType[T]) {
    if (!isValueValid(setting, value))
      throw new Error(`"${value}" is an invalid ${setting}`);
    if (this.#hasLocalStorage) window.localStorage.setItem(setting, `${value}`);
    this.#settings[setting] = value;
  }

  get<T extends AppSetting>(setting: T): AppSettingType[T] {
    let value = this.#settings[setting];
    if (!isValueValid(setting, value)) {
      value = kDefaultAppSettings[setting];
      this.set(setting, value);
    }
    return value;
  }

  getAll(): AppSettingType {
    return { ...this.#settings };
  }

  reset() {
    Object.entries(kDefaultAppSettings).forEach(([setting, defaultValue]) => {
      this.set(setting as AppSetting, defaultValue);
    });
  }
}

export default new AppSettings();
