'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMerchantMenuQuery } from '@plate40/state';
import type { MenuItem } from '@plate40/types';
import { Badge, Card, ErrorState, FoodTypeIndicator, PageHeader, Price, Skeleton } from '@plate40/ui';
import { DataTable } from '../../../components/data-table';

const columns: Array<ColumnDef<MenuItem>> = [
  { accessorKey: 'name', header: 'Item' },
  { accessorKey: 'foodType', header: 'Food type', cell: ({ row }) => <span style={{ display: 'flex', gap: 6 }}><FoodTypeIndicator vegetarian={row.original.foodType === 'VEG'} />{row.original.foodType}</span> },
  { accessorKey: 'price', header: 'Price', cell: ({ row }) => <Price value={row.original.discountedPrice || row.original.price} /> },
  { accessorKey: 'preparationTimeMinutes', header: 'Prep time', cell: ({ row }) => `${row.original.preparationTimeMinutes} min` },
  { accessorKey: 'isAvailable', header: 'Availability', cell: ({ row }) => <Badge tone={row.original.isAvailable ? 'success' : 'danger'}>{row.original.isAvailable ? 'In stock' : 'Unavailable'}</Badge> },
];
export default function MerchantMenuPage() { const { data = [], isLoading, isError } = useMerchantMenuQuery(); return <main className="dashboard-page"><PageHeader title="Menu & stock" description="Live kitchen menu inventory." />{isLoading ? <Skeleton /> : isError ? <ErrorState /> : <Card className="table-card"><DataTable data={data} columns={columns} emptyMessage="No menu items found." /></Card>}</main>; }
