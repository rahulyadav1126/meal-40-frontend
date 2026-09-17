'use client';
import type { ReactNode } from 'react';
import { Plate40StateProvider } from '@plate40/state';
import { Toaster } from 'sonner';
export function AppProviders({ children }: { children: ReactNode }) { return <Plate40StateProvider>{children}<Toaster richColors position="top-right" /></Plate40StateProvider>; }
