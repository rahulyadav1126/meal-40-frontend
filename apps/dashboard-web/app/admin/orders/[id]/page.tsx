'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdminOrderQuery, useOrderTrackingQuery } from '@plate40/state';
import { OrderStatus } from '@plate40/types';
import { Card, DeliveryMap, ErrorState, OrderStatusBadge, PageHeader, PaymentStatusBadge, Price, Skeleton } from '@plate40/ui';
export default function AdminOrderDetailPage() {
  const id = useParams<{ id: string }>().id;
  const query = useAdminOrderQuery(id, { pollingInterval: 15000 });
  const order = query.data;
  const terminal = !!order && [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REJECTED, OrderStatus.REFUNDED].includes(order.orderStatus);
  const tracking = useOrderTrackingQuery(id, { pollingInterval: 10000, skip: !order || terminal });
  if (query.isLoading) return <main className="p-6"><Skeleton /></main>;
  if (query.isError || !order) return <main className="p-6"><ErrorState message="Order not found or unavailable." /></main>;
  return <main className="p-4 sm:p-6 max-w-6xl mx-auto"><Link href="/admin/orders" className="underline">Back to orders</Link><PageHeader title={`Order #${order.orderNumber}`} description={order.restaurant?.name} actions={<OrderStatusBadge status={order.orderStatus} />} /><Card className="p-5"><ul className="list-none p-0 divide-y">{order.items?.map(item => <li className="flex justify-between gap-3 py-3" key={item.id}><span>{item.quantity} × {item.itemName}</span><Price value={item.totalPrice} /></li>)}</ul><p>Total: <Price value={order.totalAmount} /> · {order.paymentMethod}</p><PaymentStatusBadge status={order.paymentStatus} />{order.customerNote && <p>Customer note: {order.customerNote}</p>}</Card>{!terminal && <DeliveryMap tracking={tracking.currentData} loading={tracking.isLoading} error={tracking.isError} onRetry={() => { void tracking.refetch(); }} />}</main>;
}
