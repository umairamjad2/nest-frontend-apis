import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { TokenResponse } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * The axios instance every API call goes through.
 * withCredentials lets the browser store and send the backend's refresh_token cookie.
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// Access token: kept in memory only (never localStorage), as the backend requires.
// It is lost on page reload; AuthProvider gets a new one with refreshAccessToken().
// ---------------------------------------------------------------------------

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// Called when a refresh fails, so AuthProvider can show the user as logged out.
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

// ---------------------------------------------------------------------------
// Refresh: only one request at a time.
// The backend rotates the refresh token on every refresh and ends the session if an
// old one is sent again. Two parallel refreshes would send the same cookie twice, so
// every caller shares the same in-flight promise instead.
// ---------------------------------------------------------------------------

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    // Plain axios, not `api`, so a failed refresh doesn't trigger the 401 interceptor below.
    refreshPromise = axios
      .post<TokenResponse>(`${API_URL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.access_token);
        return res.data.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Interceptors
// ---------------------------------------------------------------------------

// Add the access token to every request.
api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// A 401 on these means wrong credentials or no session, not an expired access token.
const NO_REFRESH_ROUTES = ['/auth/login', '/auth/refresh'];

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// On a 401: refresh once, then retry the original request with the new token.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !NO_REFRESH_ROUTES.some((route) => original.url?.startsWith(route));

    if (!shouldRefresh) {
      throw error;
    }

    original._retried = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      // Refresh token is missing, expired or revoked: the user must log in again.
      setAccessToken(null);
      onSessionExpired?.();
      throw error;
    }
  },
);
