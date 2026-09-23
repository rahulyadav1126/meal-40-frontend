import Link from 'next/link';
import { BadgeIndianRupee, Sparkles, Tag } from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { Button, Card, PageHeader } from '@plate40/ui';

export default function OffersPage() {
  return (
    <main className="p40-container py-8 pb-16 min-h-[70vh]">
      <PageHeader title="Pocket-friendly offers" description="Available promotions are confirmed by the backend during checkout." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 h-full">
          <BadgeIndianRupee className="text-p40-primary mb-2" />
          <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Everyday value</span>
          <h2 className="mt-1 mb-2">Meals starting at ₹40</h2>
          <p className="text-p40-muted m-0">Browse neighborhood dishes designed for a reliable daily budget.</p>
        </Card>
        <Card className="p-5 h-full">
          <Tag className="text-p40-primary mb-2" />
          <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Coupon ready</span>
          <h2 className="mt-1 mb-2">Backend-verified savings</h2>
          <p className="text-p40-muted m-0">Coupons, limits, and expiry are always validated securely when the order is placed.</p>
        </Card>
        <Card className="p-5 h-full">
          <Sparkles className="text-p40-primary mb-2" />
          <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Fresh kitchens</span>
          <h2 className="mt-1 mb-2">Local specials</h2>
          <p className="text-p40-muted m-0">Discover meal offers published by approved Plate40 kitchens.</p>
        </Card>
      </div>
      <p className="mt-6">
        <Link href={ROUTES.customer.restaurants}>
          <Button>Explore restaurants</Button>
        </Link>
      </p>
    </main>
  );
}
