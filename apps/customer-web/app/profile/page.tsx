import Link from 'next/link';
import { MapPin, PackageOpen, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { Card, PageHeader } from '@plate40/ui';

export default function ProfilePage() {
  return <main className="page-shell p40-container"><PageHeader title="Your Plate40 account" description="Manage delivery details and order preferences." /><div className="profile-grid"><Link href={ROUTES.customer.orders}><Card><PackageOpen /><h2>Orders</h2><p>Track current orders and see your history.</p></Card></Link><Link href={ROUTES.customer.addresses}><Card><MapPin /><h2>Addresses</h2><p>Manage saved delivery locations.</p></Card></Link><Card><ShieldCheck /><h2>Sessions</h2><p>Review signed-in devices through the auth service.</p></Card></div></main>;
}
