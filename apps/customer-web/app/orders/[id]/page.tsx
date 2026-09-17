'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, Circle } from 'lucide-react';
import { io } from 'socket.io-client';
import { API_URLS, STORAGE_KEYS } from '@plate40/config';
import { baseApi, useAppDispatch, useOrderQuery } from '@plate40/state';
import { OrderStatus } from '@plate40/types';
import { Card, ErrorState, OrderStatusBadge, PageHeader, PaymentStatusBadge, Price, Skeleton } from '@plate40/ui';
import { humanize } from '@plate40/utils';

const ORDER_FLOW = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED] as const;

export default function OrderDetailPage() {
  const id = useParams<{ id: string }>().id;
  const dispatch = useAppDispatch();
  const { data: order, isLoading, isError } = useOrderQuery(id);
  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_KEYS.accessToken);
    if (!token) return;
    const socket = io(API_URLS.socket, { auth: { token } });
    const refresh = () => dispatch(baseApi.util.invalidateTags([{ type: 'Orders', id }]));
    ['order.accepted','order.rejected','order.preparing','order.ready','order.out_for_delivery','order.delivered','payment.success','payment.failed'].forEach((event) => socket.on(event, refresh));
    return () => { socket.disconnect(); };
  }, [dispatch, id]);
  if (isLoading) return <main className="page-shell p40-container"><Skeleton /></main>;
  if (isError || !order) return <main className="page-shell p40-container"><ErrorState message="Order not found or unavailable." /></main>;
  const current = ORDER_FLOW.indexOf(order.orderStatus as (typeof ORDER_FLOW)[number]);
  return <main className="page-shell p40-container"><PageHeader title="Checkout & live delivery" description={`Order #${order.orderNumber}`} actions={<OrderStatusBadge status={order.orderStatus} />} /><div className="tracking-layout"><Card className="tracking-card"><span className="section-kicker">Live kitchen & logistics telemetry</span><h2>{order.restaurant?.name ?? 'Your Plate40 kitchen'}</h2><div className="timeline">{ORDER_FLOW.map((status, index) => { const complete = index <= current; return <div className={complete ? 'timeline__step timeline__step--complete' : 'timeline__step'} key={status}><span>{complete ? <Check size={16} /> : <Circle size={14} />}</span><div><strong>{humanize(status)}</strong><p>{status === order.orderStatus ? 'Current order stage' : index < current ? 'Completed' : 'Waiting for the kitchen'}</p></div></div>; })}</div></Card><Card className="tracking-summary"><span className="section-kicker">Order summary</span><h2>Payment & total</h2><div><span>Payment</span><PaymentStatusBadge status={order.paymentStatus} /></div><div><span>Method</span><strong>{humanize(order.paymentMethod)}</strong></div><div><span>Subtotal</span><Price value={order.subtotal} /></div><div><span>Delivery fee</span><Price value={order.deliveryFee} /></div><div><span>Platform fee</span><Price value={order.platformFee} /></div><div><span>Taxes</span><Price value={order.taxAmount} /></div><div className="cart-summary__total"><span>Total</span><Price value={order.totalAmount} /></div></Card></div></main>;
}
