'use client';

import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Bell, ClipboardList, CookingPot, CreditCard, LayoutDashboard, Settings, Store, UsersRound } from 'lucide-react';
import { ROUTES, STORAGE_KEYS } from '@plate40/config';
import { UserRole, type User } from '@plate40/types';

const ADMIN_NAV = [
  { href: ROUTES.admin.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.admin.orders, label: 'Orders management', icon: ClipboardList },
  { href: ROUTES.admin.restaurants, label: 'Restaurants & approvals', icon: Store },
  { href: ROUTES.admin.users, label: 'Customers & users', icon: UsersRound },
  { href: ROUTES.admin.payments, label: 'Payments & revenue', icon: CreditCard },
  { href: ROUTES.admin.reports, label: 'Platform reports', icon: BarChart3 },
] as const;
const MERCHANT_NAV = [
  { href: ROUTES.merchant.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.merchant.orders, label: 'Live KDS orders', icon: CookingPot },
  { href: ROUTES.merchant.menu, label: 'Menu & stock', icon: Store },
  { href: ROUTES.merchant.earnings, label: 'Earnings & payouts', icon: BarChart3 },
  { href: ROUTES.merchant.reviews, label: 'Customer reviews', icon: UsersRound },
  { href: ROUTES.merchant.settings, label: 'Store settings', icon: Settings },
] as const;

export function DashboardShell({ role, children }: { role: UserRole.ADMIN | UserRole.MERCHANT; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const rawUser = useSyncExternalStore(() => () => undefined, () => window.localStorage.getItem(STORAGE_KEYS.user), () => null);
  const user = useMemo(() => { if (!rawUser) return null; try { return JSON.parse(rawUser) as User; } catch { return null; } }, [rawUser]);
  useEffect(() => { if (!user || user.role !== role) router.replace('/login'); }, [role, router, user]);
  if (!user || user.role !== role) return <div className="ops-placeholder">Checking access...</div>;
  const navigation = role === UserRole.ADMIN ? ADMIN_NAV : MERCHANT_NAV;
  return <div className="dashboard-shell"><aside className="dashboard-sidebar"><div className="dashboard-brand"><span className="dashboard-brand__mark">P</span><div><strong>Plate40</strong><small>{role === UserRole.ADMIN ? 'Administration Console' : 'Kitchen Console'}</small></div></div><div className="role-switch">{role === UserRole.ADMIN ? 'ADMIN VIEW' : 'MERCHANT VIEW'}</div><nav className="dashboard-nav">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}><Icon size={19} />{label}</Link>)}</nav><div className="dashboard-sidebar__footer"><span>● Platform operational</span><span>Support desk available</span></div></aside><div className="dashboard-main"><header className="dashboard-topbar"><div><h1>{role === UserRole.ADMIN ? 'Platform Administration Console' : 'KDS Live Dispatch'}</h1><p>{role === UserRole.ADMIN ? 'Ecosystem telemetry and partner operations' : 'Real-time incoming orders and kitchen prep line'}</p></div><div className="dashboard-user"><Bell size={20} /><span>{user.name.slice(0, 2).toUpperCase()}</span><div><strong>{user.name}</strong><small style={{ display: 'block' }}>{role}</small></div></div></header>{children}</div></div>;
}
