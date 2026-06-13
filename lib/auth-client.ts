import axios from "axios";

import { API_URL } from "@/constants/api";

export const authClient = axios.create({
  baseURL: `${API_URL}/auth`,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});
