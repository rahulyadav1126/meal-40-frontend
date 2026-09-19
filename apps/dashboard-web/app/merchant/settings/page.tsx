'use client';

import { useMerchantRestaurantsQuery } from '@plate40/state';
import { Card, ErrorState, PageHeader, Skeleton } from '@plate40/ui';
import { RestaurantSetupForm } from './restaurant-setup-form';

export default function SettingsPage() {
  const { data = [], isLoading, isError } = useMerchantRestaurantsQuery();
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
      <PageHeader
        title="Store settings"
        description="Restaurant profile and live operational state."
      />
      {restaurant ? (
        <Card className="panel-card">
          <div className="settings-grid">
            <div>
              <span className="section-kicker">Restaurant</span>
              <h2>{restaurant.name}</h2>
              <p>{restaurant.description || 'No restaurant description added.'}</p>
            </div>
            <dl>
              <dt>Location</dt>
              <dd>
                {restaurant.city}, {restaurant.state}
              </dd>
              <dt>Opening status</dt>
              <dd>{restaurant.openingStatus}</dd>
              <dt>Minimum order</dt>
              <dd>₹{restaurant.minimumOrderAmount}</dd>
              <dt>Delivery radius</dt>
              <dd>{restaurant.deliveryRadiusKm} km</dd>
              <dt>Approval</dt>
              <dd>{restaurant.approvalStatus}</dd>
            </dl>
          </div>
        </Card>
      ) : (
        <RestaurantSetupForm />
      )}
    </main>
  );
}
