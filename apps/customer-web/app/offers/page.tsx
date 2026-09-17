import Link from 'next/link';
import { BadgeIndianRupee, Sparkles, Tag } from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { Button, Card, PageHeader } from '@plate40/ui';

export default function OffersPage() {
  return <main className="page-shell p40-container"><PageHeader title="Pocket-friendly offers" description="Available promotions are confirmed by the backend during checkout." /><div className="offers-grid"><Card><BadgeIndianRupee /><span className="section-kicker">Everyday value</span><h2>Meals starting at ₹40</h2><p>Browse neighborhood dishes designed for a reliable daily budget.</p></Card><Card><Tag /><span className="section-kicker">Coupon ready</span><h2>Backend-verified savings</h2><p>Coupons, limits, and expiry are always validated securely when the order is placed.</p></Card><Card><Sparkles /><span className="section-kicker">Fresh kitchens</span><h2>Local specials</h2><p>Discover meal offers published by approved Plate40 kitchens.</p></Card></div><p style={{ marginTop: 24 }}><Link href={ROUTES.customer.restaurants}><Button>Explore restaurants</Button></Link></p></main>;
}
