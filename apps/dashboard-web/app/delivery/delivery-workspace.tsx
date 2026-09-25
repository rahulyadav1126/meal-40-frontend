'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bike, MapPin, PackageCheck, Wallet } from 'lucide-react';
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
  useOrderTrackingQuery,
} from '@plate40/state';
import { DeliveryStatus, PaymentMethod, type Delivery } from '@plate40/types';
import {
  Badge,
  Button,
  Card,
  DeliveryMap,
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
  const [cashCollected, setCashCollected] = useState(false);
  const [act, actionState] = useDeliveryActionMutation();
  const next = NEXT[delivery.status];
  const steps = [DeliveryStatus.ASSIGNED, DeliveryStatus.ARRIVED_AT_MERCHANT, DeliveryStatus.PICKED_UP, DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.ARRIVED_AT_CUSTOMER, DeliveryStatus.DELIVERED];
  const step = steps.indexOf(delivery.status);
  const tracking = useOrderTrackingQuery(delivery.orderId, { pollingInterval: 10000, skip: available || [DeliveryStatus.DELIVERED, DeliveryStatus.CANCELLED].includes(delivery.status) });
  async function run(action: string) {
    try {
      await act({
        deliveryId: delivery.id,
        action,
        otp: action === 'complete' ? otp : undefined,
        cashCollected: action === 'complete' ? cashCollected : undefined,
      }).unwrap();
      toast.success('Delivery updated');
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to update delivery',
      );
    }
  }
  return (
    <Card className="p-4 sm:p-6 flex flex-col gap-3 bg-white shadow-sm rounded-2xl border border-slate-200">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <strong className="text-lg flex items-center gap-2 text-green-900"><Bike size={22} />#{delivery.order?.orderNumber ?? delivery.orderId}</strong>
        <Badge tone={delivery.status === DeliveryStatus.DELIVERED ? 'success' : 'indigo'}>
          {humanize(delivery.status)}
        </Badge>
      </div>
      {!available && step >= 0 && <ol aria-label="Delivery progress" className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-0 list-none my-2">{['Assigned', 'At store', 'Picked up', 'On the way', 'At customer', 'Delivered'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={`rounded-lg px-2 py-2 text-xs text-center ${index <= step ? 'bg-green-100 text-green-900 font-semibold' : 'bg-slate-50 text-slate-400'}`}>{label}</li>)}</ol>}
      <h3 className="m-0 text-xl text-slate-900">{delivery.order?.restaurant?.name ?? 'Restaurant'}</h3>
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
      {delivery.order?.address && [DeliveryStatus.PICKED_UP, DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.ARRIVED_AT_CUSTOMER].includes(delivery.status) ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${delivery.order.address.latitude},${delivery.order.address.longitude}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          Open customer location in Maps
        </a>
      ) : null}
      {!available && ![DeliveryStatus.DELIVERED, DeliveryStatus.CANCELLED].includes(delivery.status) && <DeliveryMap riderView tracking={tracking.currentData} loading={tracking.isLoading} error={tracking.isError} onRetry={() => { void tracking.refetch(); }} />}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-2 pt-4 border-t border-slate-100">
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
          <Button className="w-full sm:w-auto min-h-12" disabled={actionState.isLoading} onClick={() => run(next.action)}>
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
              aria-label="Customer delivery verification code"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
            />
            <Button
              disabled={actionState.isLoading || otp.length !== 6 || (delivery.order.paymentMethod === PaymentMethod.COD && !cashCollected)}
              onClick={() => run('complete')}
            >
              Verify OTP & Complete
            </Button>
            {delivery.order.paymentMethod === PaymentMethod.COD && <label className="flex items-center gap-2"><input type="checkbox" checked={cashCollected} onChange={event => setCashCollected(event.target.checked)} />Collected <Price value={delivery.order.totalAmount} /> in cash</label>}
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
    const reconnect = () => {
      const currentToken = window.localStorage.getItem(STORAGE_KEYS.accessToken);
      socket.disconnect();
      if (currentToken) { socket.auth = { token: currentToken }; socket.connect(); }
    };
    window.addEventListener('plate40:session-changed', reconnect);
    const refresh = () =>
      dispatch(baseApi.util.invalidateTags(['Delivery', 'DeliveryProfile', 'DeliveryEarnings', 'Tracking']));
    socket.on('delivery.available', refresh);
    socket.on('delivery.updated', refresh);
    return () => {
      window.removeEventListener('plate40:session-changed', reconnect);
      socket.disconnect();
    };
  }, [dispatch]);
  if (profile.isLoading)
    return (
      <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <Skeleton />
      </main>
    );
  if (profile.isError || !profile.data)
    return (
      <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
      <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto">
        {active.data.map((item) => (
          <DeliveryCard key={item.id} delivery={item} />
        ))}
      </div>
    ) : (
      <EmptyState title="No active delivery" description="Accept an available order to begin." />
    );
  else if (mode === 'history')
    content = history.data?.length ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        <section className="rounded-3xl bg-green-950 text-white p-6 sm:p-8 mb-6 flex flex-wrap items-center justify-between gap-6"><div><span className="text-xs uppercase tracking-widest text-green-200">Your delivery workspace</span><h2 className="text-2xl sm:text-3xl mt-2 mb-3">{active.data?.length ? 'One order. Every step in view.' : partner.isOnline ? 'Ready for your next pickup' : 'Your next delivery starts here'}</h2><p className="text-green-100 text-sm max-w-xl m-0">{active.data?.length ? 'Follow the route, confirm pickup at the store, then head to the customer.' : 'Go online, accept an available order and follow each handoff safely.'}</p></div><Link href={active.data?.length ? '/delivery/active' : '/delivery/available'} className="rounded-xl bg-white text-green-950 px-5 py-3 font-semibold">{active.data?.length ? 'Continue delivery' : 'Find deliveries'} →</Link></section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <small className="flex gap-2 items-center text-slate-500"><MapPin size={17} />Available</small>
            <h2>{available.data?.length ?? 0}</h2>
          </Card>
          <Card>
            <small className="flex gap-2 items-center text-slate-500"><Bike size={17} />Active</small>
            <h2>{active.data?.length ?? 0}</h2>
          </Card>
          <Card>
            <small className="flex gap-2 items-center text-slate-500"><PackageCheck size={17} />Completed</small>
            <h2>{stats?.completedDeliveries ?? 0}</h2>
          </Card>
          <Card>
            <small className="flex gap-2 items-center text-slate-500"><Wallet size={17} />Today&apos;s earnings</small>
            <h2>₹{stats?.today ?? '0.00'}</h2>
          </Card>
        </div>
        {active.data?.map((item) => (
          <DeliveryCard key={item.id} delivery={item} />
        ))}
        {!active.isFetching && !active.isError && !active.data?.length && <EmptyState title="No active delivery" description="Accept a pickup request to see its route and step-by-step actions here." />}
      </>
    );
  return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title={title}
        description="Manage pickups, handoffs and earnings in real time."
        actions={
          <Button
            disabled={pending || availabilityState.isLoading}
            variant={partner.isOnline ? 'danger' : 'operational'}
            onClick={async () => { try { await setOnline(!partner.isOnline).unwrap(); } catch (error) { toast.error((error as { data?: { message?: string } })?.data?.message ?? 'Unable to update availability'); } }}
          >
            {partner.isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        }
      />
      {!pending && (active.isError || available.isError || history.isError || earnings.isError) && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="mt-0 text-sm">Some delivery information could not be loaded. Totals may be unavailable.</p><Button variant="secondary" onClick={() => { void active.refetch(); void available.refetch(); void history.refetch(); void earnings.refetch(); }}>Refresh delivery data</Button></div>}
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
