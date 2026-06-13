import axios from 'axios';

import { API_URL } from '@/constants/api';
import { forceLogout } from '@/lib/auth-session';
import { useAuthStore } from '@/stores/auth.store';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

const BASE_URL = `${API_URL}/api/v1`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-access-token'] = token;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      await forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      await forceLogout();
      return Promise.reject(error);
    }

    try {
      // Use a standalone axios call to avoid a require-cycle with auth.service
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const newToken: string = data.data.accessToken;
      const newRefreshToken: string = data.data.refreshToken;

      useAuthStore.getState().setToken(newToken);
      if (newRefreshToken) {
        useAuthStore.getState().setRefreshToken(newRefreshToken);
      }

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      originalRequest.headers['x-access-token'] = newToken;
      return apiClient(originalRequest);
    } catch {
      await forceLogout();
      return Promise.reject(error);
    }
  },
);
