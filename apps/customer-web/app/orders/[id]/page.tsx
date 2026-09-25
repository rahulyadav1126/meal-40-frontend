'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, Check, Circle, XCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { API_URLS, STORAGE_KEYS } from '@plate40/config';
import { baseApi, useAppDispatch, useOrderQuery } from '@plate40/state';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@plate40/types';
import {
  Card,
  ErrorState,
  OrderStatusBadge,
  PageHeader,
  PaymentStatusBadge,
  Price,
  Skeleton,
} from '@plate40/ui';
import { humanize } from '@plate40/utils';
import { ReviewDialog } from './review-dialog';

// ── Happy-path flow (for timeline) ───────────────────────────────────────────
const ORDER_FLOW = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.ASSIGNED,
  OrderStatus.PICKED_UP,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
] as const;

// ── Terminal negative statuses ────────────────────────────────────────────────
const CANCELLED_STATUSES: string[] = [OrderStatus.REJECTED, OrderStatus.CANCELLED];

export default function OrderDetailPage() {
  const id = useParams<{ id: string }>().id;
  const dispatch = useAppDispatch();
  const { data: order, isLoading, isError } = useOrderQuery(id);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // ── Real-time updates via Socket.IO ──────────────────────────────────────
  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_KEYS.accessToken);
    if (!token) return;
    const socket = io(API_URLS.socket, { auth: { token } });
    const refresh = () => dispatch(baseApi.util.invalidateTags([{ type: 'Orders', id }]));
    [
      'order.accepted',
      'order.rejected',
      'order.cancelled',
      'order.preparing',
      'order.ready',
      'order.out_for_delivery',
      'order.delivered',
      'delivery.updated',
      'payment.success',
      'payment.failed',
    ].forEach((event) => socket.on(event, refresh));
    return () => {
      socket.disconnect();
    };
  }, [dispatch, id]);

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading)
    return (
      <main className="page-shell p40-container">
        <Skeleton />
      </main>
    );
  if (isError || !order)
    return (
      <main className="page-shell p40-container">
        <ErrorState message="Order not found or unavailable." />
      </main>
    );

  const isCancelled = CANCELLED_STATUSES.includes(order.orderStatus);
  const isRejected = order.orderStatus === OrderStatus.REJECTED;
  const current = ORDER_FLOW.indexOf(order.orderStatus as (typeof ORDER_FLOW)[number]);

  let displayPaymentStatus = order.paymentStatus;
  if (order.paymentStatus === PaymentStatus.PENDING) {
    if (order.paymentMethod === PaymentMethod.ONLINE && current >= ORDER_FLOW.indexOf(OrderStatus.ACCEPTED)) {
      displayPaymentStatus = PaymentStatus.PAID;
    } else if (order.orderStatus === OrderStatus.DELIVERED) {
      displayPaymentStatus = PaymentStatus.PAID;
    } else if (isCancelled || isRejected) {
      displayPaymentStatus = order.paymentMethod === PaymentMethod.ONLINE ? PaymentStatus.REFUNDED : PaymentStatus.FAILED;
    }
  }

  return (
    <main className="p40-container py-8 pb-16 min-h-[70vh]">
      <PageHeader
        title="Checkout & live delivery"
        description={`Order #${order.orderNumber}`}
        actions={<OrderStatusBadge status={order.orderStatus} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* ── Left panel: timeline OR cancellation notice ─────────────────── */}
        <Card className="p-5">
          <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Live kitchen &amp; logistics telemetry</span>
          <h2 className="mt-2 mb-5">{order.restaurant?.name ?? 'Your Plate40 kitchen'}</h2>

          {order.delivery?.deliveryPartner ? (
            <div className="mt-4 p-4 rounded-xl bg-indigo-50">
              {order.delivery.deliveryPartner.profilePhotoUrl ? (
                <div
                  aria-label="Delivery partner photo"
                  className="w-14 h-14 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${order.delivery.deliveryPartner.profilePhotoUrl})` }}
                />
              ) : null}
              <strong>Your delivery partner: {order.delivery.deliveryPartner.name}</strong>
              <p className="my-1.5">
                {order.delivery.deliveryPartner.vehicleType} ·{' '}
                {order.delivery.deliveryPartner.vehicleNumber}
              </p>
              {order.delivery.deliveryPartner.phone ? (
                <a href={`tel:${order.delivery.deliveryPartner.phone}`}>Call delivery partner</a>
              ) : null}
            </div>
          ) : null}
          {order.deliveryOtp ? (
            <div className="mt-3 p-4 rounded-xl bg-orange-50">
              <strong>Delivery OTP: {order.deliveryOtp}</strong>
              <p className="mt-1.5 mb-0">Share this only after you receive the order.</p>
            </div>
          ) : null}

          {isCancelled ? (
            /* ── Cancellation / Rejection banner ──────────────────────────── */
            <div
              className={`mt-5 p-6 rounded-xl flex flex-col gap-3 border-2 ${
                isRejected
                  ? 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200'
                  : 'bg-gradient-to-br from-neutral-50 to-gray-100 border-gray-200'
              }`}
            >
              {/* Icon + headline */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full grid place-items-center shrink-0 ${
                    isRejected ? 'bg-red-100' : 'bg-gray-100'
                  }`}
                >
                  {isRejected ? (
                    <XCircle size={26} color="#e11d48" />
                  ) : (
                    <AlertCircle size={26} color="#6b7280" />
                  )}
                </div>
                <div>
                  <strong className="text-[1.05rem] text-gray-900">
                    {isRejected ? 'Order Rejected by Restaurant' : 'Order Cancelled'}
                  </strong>
                  <p className="mt-0.5 mb-0 text-[0.85rem] text-gray-500">
                    {isRejected
                      ? 'The restaurant was unable to accept your order at this time.'
                      : 'This order has been cancelled.'}
                  </p>
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-white rounded-lg px-4 py-[0.9rem] text-[0.82rem] text-gray-700 leading-relaxed border border-gray-100">
                <strong className="block mb-1 text-gray-900">
                  What happens next?
                </strong>
                {isRejected ? (
                  <>
                    • If you paid online, a <strong>full refund</strong> will be processed to your
                    original payment method within 3–5 business days.
                    <br />
                    • For Cash on Delivery orders, no payment was collected.
                    <br />• You can place a new order from the same or a different restaurant.
                  </>
                ) : (
                  <>
                    • If you paid online, a <strong>full refund</strong> will be initiated shortly.
                    <br />• No charges apply for COD orders that are cancelled.
                  </>
                )}
              </div>

              {/* CTA */}
              <a
                href="/restaurants"
                className="inline-flex items-center justify-center gap-1.5 py-[0.65rem] px-6 rounded-lg bg-rose-600 text-white font-bold text-[0.88rem] no-underline w-fit"
              >
                Browse restaurants →
              </a>
            </div>
          ) : (
            /* ── Normal happy-path timeline ───────────────────────────────── */
            <div className="grid">
              {ORDER_FLOW.map((status, index) => {
                const complete = index <= current;
                const isCurrent = status === order.orderStatus;
                return (
                  <div
                    key={status}
                    className={`grid grid-cols-[38px_1fr] gap-2.5 min-h-[82px] ${complete ? 'text-p40-slate' : 'text-slate-400'}`}
                  >
                    <span className={`w-7 h-7 rounded-full grid place-items-center relative ${complete ? 'text-white bg-p40-success' : 'bg-slate-100'}`}>
                      {complete ? <Check size={16} /> : <Circle size={14} />}
                      {index < ORDER_FLOW.length - 1 && (
                        <div className={`absolute top-7 left-[13px] w-[2px] h-[54px] ${complete ? 'bg-green-300' : 'bg-slate-200'}`} />
                      )}
                    </span>
                    <div>
                      <strong>{humanize(status)}</strong>
                      <p className="my-1 text-[0.82rem]">
                        {isCurrent
                          ? 'Current order stage'
                          : index < current
                            ? 'Completed'
                            : 'Waiting for the kitchen'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Right panel: order summary ──────────────────────────────────── */}
        <Card className="sticky top-[90px] p-5 grid gap-4">
          <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Order summary</span>
          <h2 className="my-1">Payment &amp; total</h2>

          <div className="flex justify-between gap-4 text-[0.85rem]">
            <span>Payment</span>
            <PaymentStatusBadge status={displayPaymentStatus} />
          </div>
          <div className="flex justify-between gap-4 text-[0.85rem]">
            <span>Method</span>
            <strong>{humanize(order.paymentMethod)}</strong>
          </div>
          <div className="flex justify-between gap-4 text-[0.85rem]">
            <span>Subtotal</span>
            <Price value={order.subtotal} />
          </div>
          <div className="flex justify-between gap-4 text-[0.85rem]">
            <span>Delivery fee</span>
            <Price value={order.deliveryFee} />
          </div>
          <div className="flex justify-between gap-4 text-[0.85rem]">
            <span>Platform fee</span>
            <Price value={order.platformFee} />
          </div>
          <div className="flex justify-between gap-4 text-[0.85rem]">
            <span>Taxes</span>
            <Price value={order.taxAmount} />
          </div>
          <div className="flex justify-between gap-4 text-[0.85rem] border-t border-dashed border-p40-border pt-4 font-[800] text-[1.2rem] font-heading">
            <span>Total</span>
            <Price value={order.totalAmount} />
          </div>

          {order.orderStatus === OrderStatus.DELIVERED && !hasReviewed && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
              <span className="text-sm font-semibold text-slate-700">How was your meal?</span>
              <button 
                onClick={() => setReviewOpen(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 py-2.5 rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
              >
                Rate your meal
              </button>
            </div>
          )}
        </Card>
      </div>

      <ReviewDialog 
        orderId={order.id}
        restaurantId={order.restaurantId}
        restaurantName={order.restaurant?.name ?? 'Plate40'}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSuccess={() => setHasReviewed(true)}
      />
    </main>
  );
}
