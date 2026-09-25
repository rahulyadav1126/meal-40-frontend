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

function sessionIdentity(): string | null {
  try { const user = JSON.parse(readStorage(STORAGE_KEYS.user) ?? 'null') as { id?: string | number } | null; return user?.id == null ? null : String(user.id); } catch { return null; }
}

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({ baseURL, timeout: 15_000 });
  client.interceptors.request.use((config) => {
    const tracked = config as typeof config & { _sessionUserId?: string | null };
    if (!('_sessionUserId' in tracked)) tracked._sessionUserId = sessionIdentity();
    const token = readStorage(STORAGE_KEYS.accessToken);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
}

export const authClient = createClient(API_URLS.auth);
export const mainClient = createClient(API_URLS.main);

export async function revokeCurrentSession(): Promise<void> {
  await authClient.post(API_PATHS.auth.logout);
}

let refreshRequest: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const observed = readStorage(STORAGE_KEYS.refreshToken);
  const rotate = async () => {
    if (observed !== readStorage(STORAGE_KEYS.refreshToken)) return readStorage(STORAGE_KEYS.accessToken);
    return rotateRefreshToken();
  };
  return typeof navigator !== 'undefined' && navigator.locks ? navigator.locks.request('plate40-refresh-session', rotate) : rotate();
}

async function rotateRefreshToken(): Promise<string | null> {
  const refreshToken = readStorage(STORAGE_KEYS.refreshToken);
  if (!refreshToken) return null;
  try {
    const response = await authClient.post<ApiResponse<AuthSession>>(API_PATHS.auth.refresh, {
      refreshToken,
    });
    const session = response.data.data;
    // Do not restore a session if the user signed out while refresh was in flight.
    if (readStorage(STORAGE_KEYS.refreshToken) !== refreshToken) return readStorage(STORAGE_KEYS.accessToken);
    window.localStorage.setItem(STORAGE_KEYS.accessToken, session.accessToken);
    window.localStorage.setItem(STORAGE_KEYS.refreshToken, session.refreshToken);
    window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(session.user));
    window.dispatchEvent(new Event('plate40:session-changed'));
    return session.accessToken;
  } catch (error) {
    if (!(error instanceof Plate40ApiError) || ![400, 401, 403].includes(error.statusCode)) return null;
    if (readStorage(STORAGE_KEYS.refreshToken) !== refreshToken) return readStorage(STORAGE_KEYS.accessToken);
    window.localStorage.removeItem(STORAGE_KEYS.accessToken);
    window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
    window.localStorage.removeItem(STORAGE_KEYS.user);
    window.dispatchEvent(new Event('plate40:session-changed'));
    return null;
  }
}

for (const client of [authClient, mainClient]) {
  client.interceptors.response.use(undefined, async (error: AxiosError) => {
    const request = error.config as (AxiosRequestConfig & { _retried?: boolean; _sessionUserId?: string | null }) | undefined;
    if (error.response?.status === 401 && request && !request._retried && ![API_PATHS.auth.refresh, API_PATHS.auth.login, API_PATHS.auth.register, API_PATHS.auth.deliveryRegister].some(path => path === request.url)) {
      if (request.signal?.aborted || request._sessionUserId !== sessionIdentity()) throw new Plate40ApiError('Request cancelled or session changed. Please retry.', 401, 'SESSION_CHANGED');
      request._retried = true;
      const current = readStorage(STORAGE_KEYS.accessToken);
      const sent = String(request.headers?.Authorization ?? '');
      let token = current && sent !== `Bearer ${current}` ? current : null;
      if (!token) {
        refreshRequest ??= refreshAccessToken().finally(() => { refreshRequest = null; });
        token = await refreshRequest;
      }
      if (token && !request.signal?.aborted && request._sessionUserId === sessionIdentity()) {
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
