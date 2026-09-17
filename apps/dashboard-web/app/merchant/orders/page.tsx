'use client';

import { Clock3, CookingPot, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ACTIONS } from '@plate40/config';
import { useMerchantOrdersQuery, useUpdateMerchantOrderMutation } from '@plate40/state';
import { OrderStatus, type Order } from '@plate40/types';
import { Badge, Button, Card, EmptyState, ErrorState, OrderStatusBadge, PageHeader, Price, Skeleton } from '@plate40/ui';

const NEXT_ACTION: Partial<Record<OrderStatus, { action: string; label: string }>> = {
  [OrderStatus.PENDING]: { action: ACTIONS.accept, label: 'Accept & send to kitchen' },
  [OrderStatus.ACCEPTED]: { action: ACTIONS.preparing, label: 'Mark preparing' },
  [OrderStatus.PREPARING]: { action: ACTIONS.ready, label: 'Mark ready' },
  [OrderStatus.READY]: { action: ACTIONS.outForDelivery, label: 'Out for delivery' },
};

function KitchenOrderCard({ order, onAction, busy }: { order: Order; onAction: (order: Order, action: string) => void; busy: boolean }) {
  const next = NEXT_ACTION[order.orderStatus];
  return <Card className="kds-order"><div className="kds-order__header"><span className="order-code">#{order.orderNumber}</span><Badge tone="danger"><Clock3 size={13} /> Live order</Badge><OrderStatusBadge status={order.orderStatus} /></div><div className="kds-order__body"><div className="kds-order__customer"><div><h3>Order {order.orderNumber}</h3><small>Restaurant #{order.restaurantId}</small></div><div><small>Order total</small><strong style={{ display: 'block', fontSize: 22 }}><Price value={order.totalAmount} /></strong></div></div><ul className="kds-order__items"><li>Canonical order details are available from the order API.</li></ul></div>{next ? <div className="kds-order__actions">{order.orderStatus === OrderStatus.PENDING ? <Button variant="danger" disabled={busy} onClick={() => onAction(order, ACTIONS.reject)}>Reject</Button> : null}<Button variant="operational" disabled={busy} onClick={() => onAction(order, next.action)}><CookingPot size={18} />{next.label}</Button></div> : null}</Card>;
}

export default function MerchantOrdersPage() {
  const { data = [], isLoading, isError } = useMerchantOrdersQuery(undefined, { pollingInterval: 15_000 });
  const [update, state] = useUpdateMerchantOrderMutation();
  async function action(order: Order, actionName: string) { try { await update({ orderId: order.id, action: actionName }).unwrap(); toast.success('Order status updated'); } catch { toast.error('Unable to update this order.'); } }
  const active = data.filter((order) => ![OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REJECTED, OrderStatus.REFUNDED].includes(order.orderStatus));
  return <main className="dashboard-page"><PageHeader title="Kitchen queue & dispatches" description="Auto-refreshing every 15 seconds with backend-authoritative order state." actions={<Badge tone="success"><PackageCheck size={14} /> Live sync</Badge>} /><div className="kds-toolbar"><div className="kds-toolbar__tabs"><span>Active orders {active.length}</span><span>Preparing {active.filter((order) => order.orderStatus === OrderStatus.PREPARING).length}</span><span>Ready {active.filter((order) => order.orderStatus === OrderStatus.READY).length}</span><span>Completed {data.filter((order) => order.orderStatus === OrderStatus.DELIVERED).length}</span></div></div>{isLoading ? <Skeleton /> : isError ? <ErrorState /> : active.length ? <div className="kds-layout"><section className="kds-queue">{active.map((order) => <KitchenOrderCard key={order.id} order={order} onAction={action} busy={state.isLoading} />)}</section><Card className="panel-card"><span className="section-kicker">Quick stock control</span><h2>Menu availability</h2><p>Open Menu & Stock to update live availability.</p><a className="p40-button p40-button--secondary" href="/merchant/menu">Open menu editor</a></Card></div> : <EmptyState title="No active kitchen orders" description="New orders will appear here when customers place them." />}</main>;
}
