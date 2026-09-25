'use client';

import { Building2, IndianRupee, ShoppingBag, UsersRound } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAdminDashboardQuery, useAdminRestaurantsQuery } from '@plate40/state';
import { RestaurantApprovalStatus } from '@plate40/types';
import { Card, ErrorState, PageHeader, Price, Skeleton, StatCard } from '@plate40/ui';

export default function AdminDashboardPage() {
  const dashboard = useAdminDashboardQuery();
  const restaurants = useAdminRestaurantsQuery();
  if (dashboard.isLoading) return <main className="p-4 sm:p-6 max-w-[1600px] mx-auto"><Skeleton /></main>;
  if (dashboard.isError || !dashboard.data) return <main className="p-4 sm:p-6 max-w-[1600px] mx-auto"><ErrorState /></main>;
  const data = dashboard.data;
  const chart = [{ name: 'Completed', value: data.completedOrders, fill: '#10b981' }, { name: 'Cancelled', value: data.cancelledOrders, fill: '#f43f5e' }, { name: 'Today', value: data.todayOrders, fill: '#f59e0b' }];
  const pending = restaurants.data?.filter((restaurant) => restaurant.approvalStatus === RestaurantApprovalStatus.PENDING) ?? [];
  return <main className="p-4 sm:p-6 max-w-[1600px] mx-auto"><PageHeader title="Platform overview" description="Real-time data supplied by the Plate40 backend." /><div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4"><StatCard label="Total orders" value={data.totalOrders} detail={`${data.todayOrders} today`} icon={<ShoppingBag />} /><StatCard label="Gross platform revenue" value={<Price value={data.totalRevenue} />} detail={`${data.completedOrders} delivered`} icon={<IndianRupee />} /><StatCard label="Active restaurants" value={data.activeRestaurants} detail={`${data.pendingApprovals} pending approvals`} icon={<Building2 />} /><StatCard label="Total users" value={data.totalCustomers + data.totalMerchants} detail={`${data.totalCustomers} customers • ${data.totalMerchants} merchants`} icon={<UsersRound />} /></div><div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mt-4"><Card className="p-[1.15rem]"><h2>Operational order status</h2><p className="text-slate-500 mt-1 mb-4">Canonical order counts from the backend.</p><div style={{ width: '100%', height: 280 }}><ResponsiveContainer><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card><Card className="p-[1.15rem]"><span className="text-[#fc8019] text-[0.68rem] font-[850] uppercase tracking-[0.11em]">Action required</span><h2 className="my-1">Pending approvals</h2><p className="text-slate-500 mt-1 mb-4">Restaurants awaiting platform review.</p><strong className="font-[800] text-[3rem] text-[#fc8019] block">{pending.length}</strong>{pending.slice(0, 3).map((restaurant) => <div className="flex justify-between items-center p-3.5 border border-indigo-200 rounded-lg bg-indigo-50/50 mt-3" key={restaurant.id}><span>{restaurant.name}</span><small>{restaurant.city}</small></div>)}</Card></div></main>;
}
