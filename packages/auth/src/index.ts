import { STORAGE_KEYS } from '@plate40/config';
import { UserRole, type AuthSession, type User } from '@plate40/types';

export const ROLE_HOME: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: '/',
  [UserRole.MERCHANT]: '/merchant/dashboard',
  [UserRole.DELIVERY_PARTNER]: '/delivery/dashboard',
  [UserRole.ADMIN]: '/admin/dashboard',
};
export const SESSION_CHANGED_EVENT = 'plate40:session-changed';

export function saveSession(session: AuthSession): void {
  window.localStorage.setItem(STORAGE_KEYS.accessToken, session.accessToken);
  window.localStorage.setItem(STORAGE_KEYS.refreshToken, session.refreshToken);
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(session.user));
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEYS.accessToken);
  window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
  window.localStorage.removeItem(STORAGE_KEYS.user);
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function updateStoredUser(user: User): void {
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(STORAGE_KEYS.user);
  if (!value) return null;
  try {
    return JSON.parse(value) as User;
  } catch {
    clearSession();
    return null;
  }
}

export function canAccessRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}
