'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { SESSION_CHANGED_EVENT } from '@plate40/auth';
import { STORAGE_KEYS } from '@plate40/config';
import type { User } from '@plate40/types';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(SESSION_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(SESSION_CHANGED_EVENT, callback);
  };
}

function snapshot() {
  return window.localStorage.getItem(STORAGE_KEYS.user);
}

export function useDashboardSession(): User | null | undefined {
  const rawUser = useSyncExternalStore<string | null | undefined>(
    subscribe,
    snapshot,
    () => undefined,
  );

  return useMemo(() => {
    if (rawUser === undefined) return undefined;
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  }, [rawUser]);
}
