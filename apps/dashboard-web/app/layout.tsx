import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import '@plate40/ui/tokens.css';
import './globals.css';
import { AppProviders } from '../providers/app-providers';

export const metadata: Metadata = { title: { default: 'Plate40 Operations', template: '%s | Plate40 Operations' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><AppProviders>{children}</AppProviders></body></html>; }
