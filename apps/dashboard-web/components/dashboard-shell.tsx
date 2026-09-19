'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  ClipboardList,
  CookingPot,
  CreditCard,
  LayoutDashboard,
  Settings,
  Store,
  UsersRound,
  History,
  MapPin,
  LogOut,
} from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { UserRole } from '@plate40/types';
import { clearSession } from '@plate40/auth';
import { baseApi, useAppDispatch } from '@plate40/state';
import { useDashboardSession } from './use-dashboard-session';

const ADMIN_NAV = [
  { href: ROUTES.admin.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.admin.orders, label: 'Orders management', icon: ClipboardList },
  { href: ROUTES.admin.restaurants, label: 'Restaurants & approvals', icon: Store },
  { href: ROUTES.admin.users, label: 'Customers & users', icon: UsersRound },
  { href: ROUTES.admin.delivery, label: 'Delivery partners', icon: MapPin },
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
const DELIVERY_NAV = [
  { href: ROUTES.delivery.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.delivery.available, label: 'Available orders', icon: ClipboardList },
  { href: ROUTES.delivery.active, label: 'Active delivery', icon: MapPin },
  { href: ROUTES.delivery.history, label: 'Delivery history', icon: History },
  { href: ROUTES.delivery.earnings, label: 'Earnings', icon: BarChart3 },
  { href: ROUTES.delivery.profile, label: 'Profile', icon: UsersRound },
  { href: ROUTES.delivery.settings, label: 'Settings', icon: Settings },
] as const;

export function DashboardShell({
  role,
  children,
}: {
  role: UserRole.ADMIN | UserRole.MERCHANT | UserRole.DELIVERY_PARTNER;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useDashboardSession();
  useEffect(() => {
    if (user !== undefined && (!user || user.role !== role)) router.replace('/login');
  }, [role, router, user]);
  if (user === undefined || !user || user.role !== role)
    return <div className="ops-placeholder">Checking access...</div>;
  const navigation =
    role === UserRole.ADMIN ? ADMIN_NAV : role === UserRole.MERCHANT ? MERCHANT_NAV : DELIVERY_NAV;
  const consoleName =
    role === UserRole.ADMIN
      ? 'Administration Console'
      : role === UserRole.MERCHANT
        ? 'Kitchen Console'
        : 'Delivery Partner';
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand__mark">P</span>
          <div>
            <strong>Plate40</strong>
            <small>{consoleName}</small>
          </div>
        </div>
        <div className="role-switch">
          {role === UserRole.ADMIN
            ? 'ADMIN VIEW'
            : role === UserRole.MERCHANT
              ? 'MERCHANT VIEW'
              : 'DELIVERY VIEW'}
        </div>
        <nav className="dashboard-nav">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <button
          className="p40-button p40-button--secondary"
          onClick={() => {
            clearSession();
            dispatch(baseApi.util.resetApiState());
            router.replace('/login');
          }}
        >
          <LogOut size={18} /> Logout
        </button>
        <div className="dashboard-sidebar__footer">
          <span>● Platform operational</span>
          <span>Support desk available</span>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1>
              {role === UserRole.ADMIN
                ? 'Platform Administration Console'
                : role === UserRole.MERCHANT
                  ? 'KDS Live Dispatch'
                  : 'Delivery Partner Console'}
            </h1>
            <p>
              {role === UserRole.ADMIN
                ? 'Ecosystem telemetry and partner operations'
                : role === UserRole.MERCHANT
                  ? 'Real-time incoming orders and kitchen prep line'
                  : 'Pickup, delivery and earnings workspace'}
            </p>
          </div>
          <div className="dashboard-user">
            <Bell size={20} />
            <span>{user.name.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small style={{ display: 'block' }}>{role}</small>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
