import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { API_PATHS, API_URLS, STORAGE_KEYS } from '@plate40/config';
import type { ApiError, ApiResponse, AuthSession } from '@plate40/types';

export class Plate40ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'Plate40ApiError';
  }
}

function readStorage(key: string): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
}

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({ baseURL, timeout: 15_000 });
  client.interceptors.request.use((config) => {
    const token = readStorage(STORAGE_KEYS.accessToken);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
}

export const authClient = createClient(API_URLS.auth);
export const mainClient = createClient(API_URLS.main);

let refreshRequest: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = readStorage(STORAGE_KEYS.refreshToken);
  if (!refreshToken) return null;
  try {
    const response = await authClient.post<ApiResponse<AuthSession>>(API_PATHS.auth.refresh, {
      refreshToken,
    });
    const session = response.data.data;
    window.localStorage.setItem(STORAGE_KEYS.accessToken, session.accessToken);
    window.localStorage.setItem(STORAGE_KEYS.refreshToken, session.refreshToken);
    window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(session.user));
    return session.accessToken;
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.accessToken);
    window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
    window.localStorage.removeItem(STORAGE_KEYS.user);
    return null;
  }
}

for (const client of [authClient, mainClient]) {
  client.interceptors.response.use(undefined, async (error: AxiosError) => {
    const request = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && request && !request._retried) {
      request._retried = true;
      refreshRequest ??= refreshAccessToken().finally(() => {
        refreshRequest = null;
      });
      const token = await refreshRequest;
      if (token) {
        request.headers = { ...request.headers, Authorization: `Bearer ${token}` };
        return client.request(request);
      }
    }
    const payload = error.response?.data as Partial<ApiError> | undefined;
    throw new Plate40ApiError(
      payload?.message ?? 'Unable to complete the request. Please try again.',
      payload?.statusCode ?? error.response?.status ?? 500,
      payload?.error ?? 'REQUEST_FAILED',
    );
  });
}

export type ClientName = 'auth' | 'main';

export async function apiRequest<T>(
  clientName: ClientName,
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await (clientName === 'auth' ? authClient : mainClient).request<ApiResponse<T>>(
    config,
  );
  const payload = response.data;
  if (payload.meta) {
    return { items: payload.data, meta: payload.meta } as T;
  }
  return payload.data;
}
