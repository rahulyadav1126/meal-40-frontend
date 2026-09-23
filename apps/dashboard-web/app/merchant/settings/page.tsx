'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMerchantRestaurantsQuery, useUpdateMerchantRestaurantMutation } from '@plate40/state';
import { RestaurantOpeningStatus } from '@plate40/types';
import { Button, Card, ErrorState, PageHeader, Skeleton } from '@plate40/ui';
import { RestaurantSetupForm } from './restaurant-setup-form';

export default function SettingsPage() {
  const { data = [], isLoading, isError } = useMerchantRestaurantsQuery();
  const [updateRestaurant, updateState] = useUpdateMerchantRestaurantMutation();
  const [isEditing, setIsEditing] = useState(false);
  if (isLoading)
    return (
      <main className="dashboard-page">
        <Skeleton />
      </main>
    );
  if (isError)
    return (
      <main className="dashboard-page">
        <ErrorState />
      </main>
    );
  const restaurant = data[0];
  return (
    <main className="dashboard-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <PageHeader
          title="Store settings"
          description="Restaurant profile and live operational state."
        />
        {restaurant && !isEditing && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={updateState.isLoading}
              onClick={async () => {
                const newStatus =
                  restaurant.openingStatus === RestaurantOpeningStatus.OPEN
                    ? RestaurantOpeningStatus.CLOSED
                    : RestaurantOpeningStatus.OPEN;
                try {
                  await updateRestaurant({ id: restaurant.id, openingStatus: newStatus }).unwrap();
                  toast.success(`Store marked as ${newStatus}`);
                } catch {
                  toast.error('Could not update store status');
                }
              }}
            >
              {updateState.isLoading ? 'Updating...' : restaurant.openingStatus === RestaurantOpeningStatus.OPEN ? 'Close Store' : 'Open Store'}
            </Button>
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </div>
        )}
      </div>
      {restaurant ? (
        isEditing ? (
          <RestaurantSetupForm restaurant={restaurant} onCancel={() => setIsEditing(false)} />
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
    </main>
  );
}
