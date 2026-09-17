import { UserRole } from '@plate40/types';
import { DashboardShell } from '../../components/dashboard-shell';
export default function MerchantLayout({ children }: { children: React.ReactNode }) { return <DashboardShell role={UserRole.MERCHANT}>{children}</DashboardShell>; }
