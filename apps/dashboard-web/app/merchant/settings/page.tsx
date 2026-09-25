'use client';

import { useState } from 'react';
import { useMerchantRestaurantsQuery } from '@plate40/state';
import { Button, Card, ErrorState, PageHeader, Skeleton } from '@plate40/ui';
import { RestaurantSetupForm } from './restaurant-setup-form';
import { AvailabilityPanel } from './availability-panel';

export default function SettingsPage() {
  const { data = [], isLoading, isError } = useMerchantRestaurantsQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  if (isLoading)
    return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <Skeleton />
      </main>
    );
  if (isError)
    return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <ErrorState />
      </main>
    );
  const restaurant = data.find(r => String(r.id) === selectedId) ?? data[0];
  return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      {data.length > 1 && <label className="p40-field mb-5">Outlet<select className="p40-input" value={restaurant?.id ?? ''} onChange={e => { setSelectedId(e.target.value); setIsEditing(false); }}>{data.map(r => <option value={r.id} key={r.id}>{r.name} — {r.city}</option>)}</select></label>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <PageHeader
          title="Store settings"
          description="Restaurant profile and live operational state."
        />
        {restaurant && !isEditing && !isCreating && (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            <Button variant="secondary" onClick={() => setIsCreating(true)}>Register another outlet</Button>
          </div>
        )}
      </div>
      {isCreating ? <RestaurantSetupForm key="new-outlet" onCancel={() => setIsCreating(false)} /> : restaurant ? (
        isEditing ? (
          <RestaurantSetupForm key={restaurant.id} restaurant={restaurant} onCancel={() => setIsEditing(false)} />
        ) : (
        <Card className="p-8 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border-none">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
            <div>
              <span className="text-[#fc8019] text-xs font-extrabold tracking-[0.1em] uppercase mb-2 block">Restaurant Profile</span>
              <h2 className="text-[#06402b] text-3xl font-bold mt-0 mb-3">{restaurant.name}</h2>
              <p className="text-slate-500 leading-[1.6] m-0">{restaurant.description || 'No restaurant description added.'}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <dl className="grid grid-cols-[140px_1fr] gap-y-4 text-sm m-0">
                <dt className="text-slate-500 font-medium py-1">Location</dt>
                <dd className="font-semibold text-slate-800 m-0 py-1">
                  {restaurant.city}, {restaurant.state}
                </dd>
                <dt className="text-slate-500 font-medium pt-4 border-t border-slate-200 py-1">Opening status</dt>
                <dd className="font-semibold text-slate-800 m-0 pt-4 border-t border-slate-200 py-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${restaurant.openingStatus === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                    {restaurant.openingStatus}
                  </span>
                </dd>
                <dt className="text-slate-500 font-medium pt-4 border-t border-slate-200 py-1">Minimum order</dt>
                <dd className="font-semibold text-slate-800 m-0 pt-4 border-t border-slate-200 py-1">₹{restaurant.minimumOrderAmount}</dd>
                <dt className="text-slate-500 font-medium pt-4 border-t border-slate-200 py-1">Delivery radius</dt>
                <dd className="font-semibold text-slate-800 m-0 pt-4 border-t border-slate-200 py-1">{restaurant.deliveryRadiusKm} km</dd>
                <dt className="text-slate-500 font-medium pt-4 border-t border-slate-200 py-1">Approval</dt>
                <dd className="font-semibold text-slate-800 m-0 pt-4 border-t border-slate-200 py-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${restaurant.approvalStatus === 'APPROVED' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                    {restaurant.approvalStatus}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </Card>
        )
      ) : (
        <RestaurantSetupForm />
      )}
      {restaurant && !isEditing && !isCreating && <AvailabilityPanel key={`${restaurant.id}-${restaurant.availabilityVersion}`} restaurant={restaurant} />}
    </main>
  );
}
