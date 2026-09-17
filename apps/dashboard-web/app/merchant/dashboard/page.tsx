'use client';

import { IndianRupee, ShoppingBag, Timer, UtensilsCrossed } from 'lucide-react';
import { useMerchantMenuQuery, useMerchantOrdersQuery, useMerchantRestaurantsQuery } from '@plate40/state';
import { OrderStatus } from '@plate40/types';
import { ErrorState, PageHeader, Price, Skeleton, StatCard } from '@plate40/ui';

export default function MerchantDashboardPage() {
  const orders = useMerchantOrdersQuery(); const menu = useMerchantMenuQuery(); const restaurants = useMerchantRestaurantsQuery();
  if (orders.isLoading || menu.isLoading || restaurants.isLoading) return <main className="dashboard-page"><Skeleton /></main>;
  if (orders.isError) return <main className="dashboard-page"><ErrorState /></main>;
  const allOrders = orders.data ?? []; const pending = allOrders.filter((order) => order.orderStatus === OrderStatus.PENDING).length; const delivered = allOrders.filter((order) => order.orderStatus === OrderStatus.DELIVERED); const revenue = delivered.reduce((total, order) => total + Number(order.totalAmount), 0);
  return <main className="dashboard-page"><PageHeader title={restaurants.data?.[0]?.name ?? 'Merchant dashboard'} description="Live kitchen readiness and order performance." /><div className="stats-grid"><StatCard label="Total orders" value={allOrders.length} icon={<ShoppingBag />} /><StatCard label="Pending orders" value={pending} icon={<Timer />} /><StatCard label="Available menu items" value={(menu.data ?? []).filter((item) => item.isAvailable).length} icon={<UtensilsCrossed />} /><StatCard label="Delivered revenue" value={<Price value={revenue} />} icon={<IndianRupee />} /></div></main>;
}
