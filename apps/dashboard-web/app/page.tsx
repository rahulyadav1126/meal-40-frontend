'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROLE_HOME } from '@plate40/auth';
import { UserRole } from '@plate40/types';
import { useDashboardSession } from '../components/use-dashboard-session';

export default function DashboardRootPage() {
  const router = useRouter();
  const user = useDashboardSession();

  useEffect(() => {
    if (user === undefined) return;
    if (
      user?.role === UserRole.ADMIN ||
      user?.role === UserRole.MERCHANT ||
      user?.role === UserRole.DELIVERY_PARTNER
    ) {
      router.replace(ROLE_HOME[user.role]);
    } else {
      router.replace('/login');
    }
  }, [router, user]);

  return <main className="ops-placeholder">Restoring your session...</main>;
}
