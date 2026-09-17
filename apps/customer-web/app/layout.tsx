import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import '@plate40/ui/tokens.css';
import './globals.css';
import { AppProviders } from '../providers/app-providers';
import { CustomerHeader } from '../components/customer-header';
import { CustomerFooter } from '../components/customer-footer';

export const metadata: Metadata = { title: { default: 'Plate40', template: '%s | Plate40' }, description: 'Wholesome homestyle meals from verified kitchens.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppProviders><CustomerHeader />{children}<CustomerFooter /></AppProviders></body></html>;
}
