import axios from 'axios';
import { tokenStore } from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // ← sends the HttpOnly refresh_token cookie automatically
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Attach the in-memory access token (never touches localStorage)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
// On 401: clear token and redirect to /login immediately, no auto-refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes('/auth/login')
    ) {
      tokenStore.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
