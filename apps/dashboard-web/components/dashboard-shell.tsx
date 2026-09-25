'use client';

import { useEffect, useState, type ReactNode } from 'react';
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
  Menu,
  X,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    <div className="min-h-screen">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 w-[250px] p-4 bg-white text-[#06402b] flex flex-col z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex gap-[0.7rem] items-center px-1 pb-4 justify-between">
          <div className="flex gap-[0.7rem] items-center">
            <span className="w-[38px] h-[38px] rounded-lg grid place-items-center bg-[#fc8019] text-white font-black">P</span>
            <div>
              <strong className="block text-[1.15rem]">Plate40</strong>
              <small className="text-slate-500">{consoleName}</small>
            </div>
          </div>
          <button className="lg:hidden text-slate-500" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <div className="px-[0.7rem] py-[0.55rem] bg-[#fff5ed] border border-[#fc8019] text-[#fc8019] rounded-lg mb-4 text-xs font-extrabold text-center">
          {role === UserRole.ADMIN
            ? 'ADMIN VIEW'
            : role === UserRole.MERCHANT
              ? 'MERCHANT VIEW'
              : 'DELIVERY VIEW'}
        </div>
        <nav className="grid gap-[0.35rem]">
          {navigation.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsSidebarOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[44px] flex gap-[0.75rem] items-center px-[0.8rem] py-[0.7rem] rounded-lg font-semibold text-[0.88rem] transition-all duration-200 ${isActive ? 'bg-[#fc8019] text-white' : 'text-[#06402b] hover:bg-[#fc8019] hover:text-white'
                  }`}
              >
                <Icon size={19} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          className="p40-button p40-button--secondary mt-4 w-full"
          onClick={() => {
            clearSession();
            dispatch(baseApi.util.resetApiState());
            router.replace('/login');
          }}
        >
          <LogOut size={18} /> Logout
        </button>
        <div className="mt-auto border-t border-slate-100 pt-4 grid gap-[0.6rem] text-[0.78rem] text-slate-500">
          <span>● Platform operational</span>
          <span>Support desk available</span>
        </div>
      </aside>
      <div className="lg:ml-[250px] min-h-screen">
        <header className="sticky top-0 z-20 min-h-[68px] border-b border-black/5 bg-[#fff7ed]/95 backdrop-blur-[10px] flex items-center justify-between px-4 sm:px-[1.5rem] py-[0.75rem] text-[#06402b]">
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="lg:hidden text-[#06402b]" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="m-0 text-[1rem] sm:text-[1.15rem] font-bold line-clamp-1">
                {role === UserRole.ADMIN
                  ? 'Platform Administration Console'
                  : role === UserRole.MERCHANT
                    ? 'KDS Live Dispatch'
                    : 'Delivery Partner Console'}
              </h1>
              <p className="mt-[0.15rem] mb-0 text-slate-500 text-[0.7rem] sm:text-[0.78rem] hidden sm:block">
                {role === UserRole.ADMIN
                  ? 'Ecosystem telemetry and partner operations'
                  : role === UserRole.MERCHANT
                    ? 'Real-time incoming orders and kitchen prep line'
                    : 'Pickup, delivery and earnings workspace'}
              </p>
            </div>
          </div>
          <div className="flex gap-[0.55rem] items-center text-[0.82rem] shrink-0">
            <Bell size={20} className="hidden sm:block" />
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full grid place-items-center bg-[#ffe4e6] text-[#fc8019] font-extrabold">{user.name.slice(0, 2).toUpperCase()}</span>
            <div className="hidden sm:block">
              <strong className="block">{user.name}</strong>
              <small className="block">{role}</small>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
