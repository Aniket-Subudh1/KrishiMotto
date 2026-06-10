import axios from 'axios';

import { API_URL } from '@/constants/api';

/** Legacy auth endpoints mounted at `/auth/*` (not under `/api/v1`). */
export const authClient = axios.create({
  baseURL: `${API_URL}/auth`,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});
