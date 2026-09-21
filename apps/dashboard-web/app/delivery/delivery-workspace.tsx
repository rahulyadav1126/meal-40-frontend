'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { API_URLS, STORAGE_KEYS } from '@plate40/config';
import {
  baseApi,
  useAppDispatch,
  useDeliveryActionMutation,
  useDeliveryActiveQuery,
  useDeliveryAvailableQuery,
  useDeliveryEarningsQuery,
  useDeliveryHistoryQuery,
  useDeliveryProfileQuery,
  useSetDeliveryAvailabilityMutation,
} from '@plate40/state';
import { DeliveryStatus, type Delivery } from '@plate40/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Price,
  Skeleton,
} from '@plate40/ui';
import { humanize } from '@plate40/utils';

type Mode = 'dashboard' | 'available' | 'active' | 'history' | 'earnings' | 'profile' | 'settings';

const NEXT: Partial<Record<DeliveryStatus, { action: string; label: string }>> = {
  [DeliveryStatus.ASSIGNED]: { action: 'arrived-merchant', label: 'Arrived at Merchant' },
  [DeliveryStatus.ARRIVED_AT_MERCHANT]: { action: 'pickup', label: 'Picked Up Order' },
  [DeliveryStatus.PICKED_UP]: { action: 'out-for-delivery', label: 'Start Delivery' },
  [DeliveryStatus.OUT_FOR_DELIVERY]: { action: 'arrived-customer', label: 'Arrived at Customer' },
};

function DeliveryCard({
  delivery,
  available = false,
}: {
  delivery: Delivery;
  available?: boolean;
}) {
  const [otp, setOtp] = useState('');
  const [act, actionState] = useDeliveryActionMutation();
  const next = NEXT[delivery.status];
  async function run(action: string) {
    try {
      await act({
        deliveryId: delivery.id,
        action,
        otp: action === 'complete' ? otp : undefined,
      }).unwrap();
      toast.success('Delivery updated');
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to update delivery',
      );
    }
  }
  return (
    <Card className="delivery-card">
      <div className="delivery-card__head">
        <strong>#{delivery.order?.orderNumber}</strong>
        <Badge tone={delivery.status === DeliveryStatus.DELIVERED ? 'success' : 'indigo'}>
          {humanize(delivery.status)}
        </Badge>
      </div>
      <h3>{delivery.order?.restaurant?.name ?? 'Restaurant'}</h3>
      <p>
        <strong>Pickup:</strong>{' '}
        {delivery.order?.restaurant?.addressLine1
          ? `${delivery.order.restaurant.addressLine1}, `
          : ''}
        {delivery.order?.restaurant?.city}, {delivery.order?.restaurant?.state}
      </p>
      <p>
        <strong>Drop:</strong>{' '}
        {delivery.order?.address
          ? `${delivery.order.address.addressLine1}, ${delivery.order.address.city}`
          : 'Shown after assignment'}
      </p>
      <p>
        {delivery.distanceKm} km · about {delivery.estimatedMinutes} min ·{' '}
        <Price value={delivery.deliveryFee} />
      </p>
      {delivery.order?.items?.length ? (
        <ul>
          {delivery.order.items.map((item) => (
            <li key={item.id}>
              {item.quantity} × {item.itemName}
            </li>
          ))}
        </ul>
      ) : null}
      {delivery.order?.customer ? (
        <p>
          <strong>Customer:</strong> {delivery.order.customer.name}{' '}
          {delivery.order.customer.phone ? (
            <a href={`tel:${delivery.order.customer.phone}`}>Call</a>
          ) : null}
        </p>
      ) : null}
      {delivery.order?.address ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${delivery.order.address.latitude},${delivery.order.address.longitude}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          Open customer location in Maps
        </a>
      ) : null}
      <div className="delivery-card__actions">
        {available ? (
          <>
            <Button disabled={actionState.isLoading} onClick={() => run('accept')}>
              Accept Delivery
            </Button>
            <Button variant="danger" disabled={actionState.isLoading} onClick={() => run('reject')}>
              Reject
            </Button>
          </>
        ) : null}
        {next ? (
          <Button disabled={actionState.isLoading} onClick={() => run(next.action)}>
            {next.label}
          </Button>
        ) : null}
        {delivery.status === DeliveryStatus.ARRIVED_AT_CUSTOMER ? (
          <>
            <input
              className="p40-input"
              inputMode="numeric"
              maxLength={6}
              placeholder="Customer OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
            />
            <Button
              disabled={actionState.isLoading || otp.length !== 6}
              onClick={() => run('complete')}
            >
              Verify OTP & Complete
            </Button>
            <Button
              variant="danger"
              disabled={actionState.isLoading}
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this order?')) {
                  run('cancel');
                }
              }}
            >
              Cancel Order
            </Button>
          </>
        ) : null}
      </div>
    </Card>
  );
}

export function DeliveryWorkspace({ mode }: { mode: Mode }) {
  const dispatch = useAppDispatch();
  const profile = useDeliveryProfileQuery(undefined, { pollingInterval: 15_000 });
  const available = useDeliveryAvailableQuery(undefined, { pollingInterval: 10_000 });
  const active = useDeliveryActiveQuery(undefined, { pollingInterval: 10_000 });
  const history = useDeliveryHistoryQuery();
  const earnings = useDeliveryEarningsQuery();
  const [setOnline, availabilityState] = useSetDeliveryAvailabilityMutation();
  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_KEYS.accessToken);
    if (!token) return;
    const socket = io(API_URLS.socket, { auth: { token } });
    const refresh = () =>
      dispatch(baseApi.util.invalidateTags(['Delivery', 'DeliveryProfile', 'DeliveryEarnings']));
    socket.on('delivery.available', refresh);
    socket.on('delivery.updated', refresh);
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
  if (profile.isLoading)
    return (
      <main className="dashboard-page">
        <Skeleton />
      </main>
    );
  if (profile.isError || !profile.data)
    return (
      <main className="dashboard-page">
        <ErrorState message="Delivery partner profile is unavailable." />
      </main>
    );
  const partner = profile.data;
  const stats = earnings.data;
  const pending = partner.approvalStatus !== 'APPROVED';
  const title = mode === 'dashboard' ? 'Delivery dashboard' : humanize(mode);
  let content: React.ReactNode;
  if (mode === 'available')
    content = available.data?.length ? (
      <div className="delivery-grid">
        {available.data.map((item) => (
          <DeliveryCard key={item.id} delivery={item} available />
        ))}
      </div>
    ) : (
      <EmptyState
        title="No available deliveries"
        description={
          partner.isOnline
            ? 'New pickup requests will appear here.'
            : 'Go online to receive delivery requests.'
        }
      />
    );
  else if (mode === 'active')
    content = active.data?.length ? (
      <div className="delivery-grid">
        {active.data.map((item) => (
          <DeliveryCard key={item.id} delivery={item} />
        ))}
      </div>
    ) : (
      <EmptyState title="No active delivery" description="Accept an available order to begin." />
    );
  else if (mode === 'history')
    content = history.data?.length ? (
      <div className="delivery-grid">
        {history.data.map((item) => (
          <DeliveryCard key={item.id} delivery={item} />
        ))}
      </div>
    ) : (
      <EmptyState
        title="No delivery history"
        description="Completed and cancelled deliveries will appear here."
      />
    );
  else if (mode === 'earnings')
    content = (
      <>
        <div className="metric-grid">
          <Card>
            <small>Today</small>
            <h2>₹{stats?.today ?? '0.00'}</h2>
          </Card>
          <Card>
            <small>This week</small>
            <h2>₹{stats?.week ?? '0.00'}</h2>
          </Card>
          <Card>
            <small>This month</small>
            <h2>₹{stats?.month ?? '0.00'}</h2>
          </Card>
          <Card>
            <small>Total</small>
            <h2>₹{stats?.total ?? '0.00'}</h2>
          </Card>
        </div>
        <p>Completed deliveries: {stats?.completedDeliveries ?? 0}</p>
      </>
    );
  else if (mode === 'profile' || mode === 'settings')
    content = (
      <Card>
        <h2>{partner.user.name}</h2>
        <p>
          {partner.user.email} · {partner.user.phone}
        </p>
        <p>
          {partner.vehicleType} · {partner.vehicleNumber}
        </p>
        <p>{partner.address}</p>
        <Badge tone={pending ? 'warning' : 'success'}>{partner.approvalStatus}</Badge>
      </Card>
    );
  else
    content = (
      <>
        <div className="metric-grid">
          <Card>
            <small>Available</small>
            <h2>{available.data?.length ?? 0}</h2>
          </Card>
          <Card>
            <small>Active</small>
            <h2>{active.data?.length ?? 0}</h2>
          </Card>
          <Card>
            <small>Completed</small>
            <h2>{stats?.completedDeliveries ?? 0}</h2>
          </Card>
          <Card>
            <small>Today&apos;s earnings</small>
            <h2>₹{stats?.today ?? '0.00'}</h2>
          </Card>
        </div>
        {active.data?.map((item) => (
          <DeliveryCard key={item.id} delivery={item} />
        ))}
      </>
    );
  return (
    <main className="dashboard-page delivery-page">
      <PageHeader
        title={title}
        description="Manage pickups, handoffs and earnings in real time."
        actions={
          <Button
            disabled={pending || availabilityState.isLoading}
            variant={partner.isOnline ? 'danger' : 'operational'}
            onClick={() => setOnline(!partner.isOnline)}
          >
            {partner.isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        }
      />
      {pending ? (
        <Card>
          <h2>Approval pending</h2>
          <p>Your documents must be approved by Plate40 before you can receive orders.</p>
        </Card>
      ) : (
        content
      )}
    </main>
  );
}
