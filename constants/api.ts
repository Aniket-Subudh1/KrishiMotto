import Constants from 'expo-constants';

type AppExtra = {
  apiUrl?: string;
  apiHost?: string;
  apiPort?: number;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

export const API_URL = extra.apiUrl ?? 'http://localhost:5000';
export const API_HOST = extra.apiHost ?? 'localhost';
export const API_PORT = extra.apiPort ?? 5000;
