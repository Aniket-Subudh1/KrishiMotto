import Constants from "expo-constants";

const DEFAULT_API_URL = "https://krishiaadhar.gramtarang.org";

type AppExtra = {
  apiUrl?: string;
};

function normalizeApiUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

export const API_URL = normalizeApiUrl(extra.apiUrl ?? DEFAULT_API_URL);
