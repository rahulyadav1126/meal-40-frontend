import { UserRole } from '@plate40/types';
import { DashboardShell } from '../../components/dashboard-shell';
import { LiveLocation } from './live-location';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role={UserRole.DELIVERY_PARTNER}><LiveLocation />{children}</DashboardShell>;
}
