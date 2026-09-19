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
    <main className="page-shell p40-container">
      <PageHeader
        title="Your orders"
        description="Follow active meals and revisit your Plate40 history."
      />
      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <ErrorState message="Sign in to see your orders." />
      ) : data.length ? (
        <div className="orders-list">
          {data.map((order) => (
            <Link href={`/orders/${order.id}`} key={order.id}>
              <Card className="order-row">
                <div>
                  <span className="order-code">#{order.orderNumber}</span>
                  <h3>{order.restaurant?.name ?? `Restaurant ${order.restaurantId}`}</h3>
                  <small>{formatDate(order.createdAt)}</small>
                </div>
                <div>
                  <OrderStatusBadge status={order.orderStatus} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
                <Price value={order.totalAmount} />
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
