'use client';

import { Clock3, CookingPot, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ACTIONS } from '@plate40/config';
import { useMerchantOrdersQuery, useUpdateMerchantOrderMutation } from '@plate40/state';
import { OrderStatus, type Order } from '@plate40/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  OrderStatusBadge,
  PageHeader,
  Price,
  Skeleton,
} from '@plate40/ui';

const NEXT_ACTION: Partial<Record<OrderStatus, { action: string; label: string }>> = {
  [OrderStatus.PENDING]: { action: ACTIONS.accept, label: 'Accept & send to kitchen' },
  [OrderStatus.ACCEPTED]: { action: ACTIONS.preparing, label: 'Mark preparing' },
  [OrderStatus.PREPARING]: { action: ACTIONS.ready, label: 'Mark ready' },
};

function KitchenOrderCard({
  order,
  onAction,
  busy,
}: {
  order: Order;
  onAction: (order: Order, action: string) => void;
  busy: boolean;
}) {
  const next = NEXT_ACTION[order.orderStatus];
  const delivered = order.orderStatus === OrderStatus.DELIVERED;
  return (
    <Card className="border-2 border-rose-300">
      <div className="py-3 px-4 bg-rose-50 flex flex-wrap gap-2.5 items-center">
        <span className="order-code">#{order.orderNumber}</span>
        <Badge tone={delivered ? 'success' : 'danger'}>
          {delivered ? <PackageCheck size={13} /> : <Clock3 size={13} />}
          {delivered ? 'Completed' : 'Live order'}
        </Badge>
        <OrderStatusBadge status={order.orderStatus} />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <div>
            <h3>Order {order.orderNumber}</h3>
            <small>Restaurant #{order.restaurantId}</small>
          </div>
          <div>
            <small>Order total</small>
            <strong className="block text-[22px]">
              <Price value={order.totalAmount} />
            </strong>
          </div>
        </div>
        <ul className="list-none p-0 grid gap-2">
          {order.items?.map(item => <li key={item.id} className="flex justify-between gap-3"><span>{item.quantity} × {item.itemName}</span><Price value={item.totalPrice} /></li>)}
        </ul>
        <Link className="p40-button p40-button--secondary" href={`/merchant/orders/${order.id}`}>View order & delivery map</Link>
      </div>
      {next ? (
        <div className="flex gap-2.5 px-4 pb-4">
          {order.orderStatus === OrderStatus.PENDING ? (
            <Button
              variant="danger"
              className="flex-1"
              disabled={busy}
              onClick={() => onAction(order, ACTIONS.reject)}
            >
              Reject
            </Button>
          ) : null}
          <Button
            variant="operational"
            className="flex-1"
            disabled={busy}
            onClick={() => onAction(order, next.action)}
          >
            {next.action === ACTIONS.deliver ? (
              <PackageCheck size={18} />
            ) : (
              <CookingPot size={18} />
            )}
            {next.label}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export default function MerchantOrdersPage() {
  const {
    data = [],
    isLoading,
    isError,
  } = useMerchantOrdersQuery(undefined, { pollingInterval: 15_000 });
  const [update, state] = useUpdateMerchantOrderMutation();
  async function action(order: Order, actionName: string) {
    try {
      await update({ orderId: order.id, action: actionName }).unwrap();
      toast.success('Order status updated');
    } catch {
      toast.error('Unable to update this order.');
    }
  }
  const active = data.filter(
    (order) =>
      ![
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.REJECTED,
        OrderStatus.REFUNDED,
      ].includes(order.orderStatus),
  );
  const completed = data.filter((order) => order.orderStatus === OrderStatus.DELIVERED);
  return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Kitchen queue & dispatches"
        description="Auto-refreshing every 15 seconds with backend-authoritative order state."
        actions={
          <Badge tone="success">
            <PackageCheck size={14} /> Live sync
          </Badge>
        }
      />
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex gap-2 overflow-auto whitespace-nowrap *:px-4 *:py-[0.7rem] *:rounded-lg *:bg-indigo-50 *:font-bold first:*:bg-orange-500 first:*:text-white">
          <span>Active orders {active.length}</span>
          <span>
            Preparing {active.filter((order) => order.orderStatus === OrderStatus.PREPARING).length}
          </span>
          <span>
            Ready {active.filter((order) => order.orderStatus === OrderStatus.READY).length}
          </span>
          <span>Completed {completed.length}</span>
        </div>
      </div>
      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <ErrorState />
      ) : (
        <>
          {active.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-4">
              <section className="grid gap-[0.9rem]">
                {active.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onAction={action}
                    busy={state.isLoading}
                  />
                ))}
              </section>
              <Card className="p-[1.15rem]">
                <span className="text-orange-500 text-[0.68rem] font-[850] uppercase tracking-[0.11em]">Quick stock control</span>
                <h2>Menu availability</h2>
                <p>Open Menu & Stock to update live availability.</p>
                <a className="p40-button p40-button--secondary" href="/merchant/menu">
                  Open menu editor
                </a>
              </Card>
            </div>
          ) : (
            <EmptyState
              title="No active kitchen orders"
              description="New orders will appear here when customers place them."
            />
          )}
          {completed.length ? (
            <section className="mt-6">
              <h2>Completed orders</h2>
              <div className="grid gap-[0.9rem]">
                {completed.slice(0, 5).map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onAction={action}
                    busy={state.isLoading}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
