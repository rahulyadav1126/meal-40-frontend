'use client';

import { Building2, IndianRupee, ShoppingBag, UsersRound } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAdminDashboardQuery, useAdminRestaurantsQuery } from '@plate40/state';
import { RestaurantApprovalStatus } from '@plate40/types';
import { Card, ErrorState, PageHeader, Price, Skeleton, StatCard } from '@plate40/ui';

export default function AdminDashboardPage() {
  const dashboard = useAdminDashboardQuery();
  const restaurants = useAdminRestaurantsQuery();
  if (dashboard.isLoading) return <main className="dashboard-page"><Skeleton /></main>;
  if (dashboard.isError || !dashboard.data) return <main className="dashboard-page"><ErrorState /></main>;
  const data = dashboard.data;
  const chart = [{ name: 'Completed', value: data.completedOrders, fill: '#10b981' }, { name: 'Cancelled', value: data.cancelledOrders, fill: '#f43f5e' }, { name: 'Today', value: data.todayOrders, fill: '#f59e0b' }];
  const pending = restaurants.data?.filter((restaurant) => restaurant.approvalStatus === RestaurantApprovalStatus.PENDING) ?? [];
  return <main className="dashboard-page"><PageHeader title="Platform overview" description="Real-time data supplied by the Plate40 backend." /><div className="stats-grid"><StatCard label="Total orders" value={data.totalOrders} detail={`${data.todayOrders} today`} icon={<ShoppingBag />} /><StatCard label="Gross platform revenue" value={<Price value={data.totalRevenue} />} detail={`${data.completedOrders} delivered`} icon={<IndianRupee />} /><StatCard label="Active restaurants" value={data.activeRestaurants} detail={`${data.pendingApprovals} pending approvals`} icon={<Building2 />} /><StatCard label="Customers" value={data.totalCustomers} detail={`${data.totalMerchants} merchants`} icon={<UsersRound />} /></div><div className="dashboard-grid"><Card className="chart-card"><h2>Operational order status</h2><p>Canonical order counts from the backend.</p><div style={{ width: '100%', height: 280 }}><ResponsiveContainer><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#4f46e5" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div></Card><Card className="panel-card"><span className="section-kicker">Action required</span><h2>Pending approvals</h2><p>Restaurants awaiting platform review.</p><strong style={{ font: '800 3rem var(--font-heading)', color: 'var(--p40-primary)' }}>{pending.length}</strong>{pending.slice(0,3).map((restaurant) => <div className="stock-row" key={restaurant.id}><span>{restaurant.name}</span><small>{restaurant.city}</small></div>)}</Card></div></main>;
}
