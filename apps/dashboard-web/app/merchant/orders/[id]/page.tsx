'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useMerchantOrderQuery, useOrderTrackingQuery, useUpdateMerchantOrderMutation } from '@plate40/state';
import { OrderStatus } from '@plate40/types';
import { Button, Card, DeliveryMap, ErrorState, OrderStatusBadge, PageHeader, PaymentStatusBadge, Price, Skeleton } from '@plate40/ui';

const NEXT: Partial<Record<OrderStatus, { action: string; label: string }>> = {
  [OrderStatus.PENDING]: { action: 'accept', label: 'Accept order' },
  [OrderStatus.ACCEPTED]: { action: 'preparing', label: 'Start preparing' },
  [OrderStatus.PREPARING]: { action: 'ready', label: 'Ready for pickup' },
};
export default function MerchantOrderDetailPage() {
  const id = useParams<{ id: string }>().id;
  const orderQuery = useMerchantOrderQuery(id, { pollingInterval: 15000 });
  const order = orderQuery.data;
  const terminal = !!order && [OrderStatus.DELIVERED, OrderStatus.REJECTED, OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(order.orderStatus);
  const tracking = useOrderTrackingQuery(id, { pollingInterval: 10000, skip: !order || terminal });
  const [update, state] = useUpdateMerchantOrderMutation();
  async function act(action: string) {
    try { await update({ orderId: Number(id), action }).unwrap(); toast.success('Order updated'); }
    catch (error) { toast.error((error as { data?: { message?: string } })?.data?.message ?? 'Unable to update order. Refresh and retry.'); }
  }
  if (orderQuery.isLoading) return <main className="p-6"><Skeleton /></main>;
  if (orderQuery.isError || !order) return <main className="p-6"><ErrorState message="Order unavailable or not assigned to your store." /><Button onClick={() => { void orderQuery.refetch(); }}>Retry</Button></main>;
  const next = NEXT[order.orderStatus];
  return <main className="p-4 sm:p-6 max-w-6xl mx-auto"><Link href="/merchant/orders" className="underline">Back to kitchen queue</Link><PageHeader title={`Order #${order.orderNumber}`} description={order.restaurant?.name} actions={<OrderStatusBadge status={order.orderStatus} />} />
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><div><Card className="p-5"><h2>Prepare these items</h2><ul className="list-none p-0 divide-y divide-slate-100">{order.items?.map(item => <li className="flex justify-between gap-4 py-3" key={item.id}><strong>{item.quantity} × {item.itemName}</strong><Price value={item.totalPrice} /></li>)}</ul>{order.customerNote && <p className="bg-amber-50 p-3 rounded-lg">Customer note: {order.customerNote}</p>}<div className="flex flex-wrap gap-3 mt-4">{order.orderStatus === OrderStatus.PENDING && <Button variant="danger" disabled={state.isLoading} onClick={() => { if (confirm('Reject this order?')) void act('reject'); }}>Reject</Button>}{next && <Button disabled={state.isLoading} onClick={() => { void act(next.action); }}>{next.label}</Button>}</div></Card>
    {!terminal && <DeliveryMap tracking={tracking.currentData} loading={tracking.isLoading} error={tracking.isError} onRetry={() => { void tracking.refetch(); }} />}</div>
    <Card className="p-5 h-fit"><h2>Order summary</h2><p>Total: <Price value={order.totalAmount} /></p><p>{order.paymentMethod}</p><PaymentStatusBadge status={order.paymentStatus} />{order.addressSnapshot && <p className="text-sm text-slate-600">Deliver to: {order.addressSnapshot.addressLine1}, {order.addressSnapshot.city}, {order.addressSnapshot.postalCode}</p>}<p className="text-sm text-slate-500">Pickup and delivery completion are handled by the assigned rider.</p></Card></div>
  </main>;
}
