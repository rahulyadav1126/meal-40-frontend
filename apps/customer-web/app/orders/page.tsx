'use client';

import Link from 'next/link';
import { useOrdersQuery } from '@plate40/state';
import {
  EmptyState,
  ErrorState,
  OrderStatusBadge,
  PageHeader,
  PaymentStatusBadge,
  Price,
  Skeleton,
  Card,
} from '@plate40/ui';
import { formatDate } from '@plate40/utils';

export default function OrdersPage() {
  const { data = [], isLoading, isError } = useOrdersQuery(undefined, { pollingInterval: 15_000 });
  return (
    <main className="p40-container py-8 pb-16 min-h-[70vh]">
      <PageHeader
        title="Your orders"
        description="Follow active meals and revisit your Plate40 history."
      />
      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <ErrorState message="Sign in to see your orders." />
      ) : data.length ? (
        <div className="grid gap-3.5">
          {data.map((order) => (
            <Link href={`/orders/${order.id}`} key={order.id} className="no-underline text-inherit block">
              <Card className="p-4 md:px-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-p40-1 transition-shadow duration-200">
                <div className="flex-1">
                  <span className="font-bold text-[0.78rem] font-mono text-p40-primary">#{order.orderNumber}</span>
                  <h3 className="mt-1.5 mb-0 block">{order.restaurant?.name ?? `Restaurant ${order.restaurantId}`}</h3>
                  <small className="mt-1.5 mb-0 block text-p40-muted">{formatDate(order.createdAt)}</small>
                </div>
                <div className="flex justify-between items-center md:gap-5 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-dashed border-slate-200 md:border-none">
                  <div className="flex gap-2 flex-wrap">
                    <OrderStatusBadge status={order.orderStatus} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  <Price value={order.totalAmount} className="text-lg md:text-base font-bold" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No orders yet"
          description="Your first wholesome meal is only a few taps away."
        />
      )}
    </main>
  );
}
