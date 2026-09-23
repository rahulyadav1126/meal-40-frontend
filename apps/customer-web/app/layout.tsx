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
  return <html lang="en"><body className="bg-slate-50 text-p40-slate min-h-screen flex flex-col antialiased"><AppProviders><CustomerHeader /><main className="flex-1">{children}</main><CustomerFooter /></AppProviders></body></html>;
}
