'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useAdminOrdersQuery } from '@plate40/state';
import type { Order } from '@plate40/types';
import { Card, ErrorState, OrderStatusBadge, PageHeader, PaymentStatusBadge, Price, Skeleton } from '@plate40/ui';
import { formatDate } from '@plate40/utils';
import { DataTable } from '../../../components/data-table';

const columns: Array<ColumnDef<Order>> = [
  { accessorKey: 'orderNumber', header: 'Order ID', cell: ({ row }) => <span className="order-code">#{row.original.orderNumber}</span> },
  { accessorKey: 'restaurantId', header: 'Restaurant', cell: ({ row }) => row.original.restaurant?.name ?? `#${row.original.restaurantId}` },
  { accessorKey: 'totalAmount', header: 'Amount', cell: ({ row }) => <Price value={row.original.totalAmount} /> },
  { accessorKey: 'paymentStatus', header: 'Payment', cell: ({ row }) => <PaymentStatusBadge status={row.original.paymentStatus} /> },
  { accessorKey: 'orderStatus', header: 'Status', cell: ({ row }) => <OrderStatusBadge status={row.original.orderStatus} /> },
  { accessorKey: 'createdAt', header: 'Date', cell: ({ row }) => formatDate(row.original.createdAt) },
];

export default function AdminOrdersPage() { const { data = [], isLoading, isError } = useAdminOrdersQuery(); return <main className="dashboard-page"><PageHeader title="Platform orders" description="Searchable operational order ledger." />{isLoading ? <Skeleton /> : isError ? <ErrorState /> : <Card className="table-card"><DataTable data={data} columns={columns} emptyMessage="No orders found." /></Card>}</main>; }
