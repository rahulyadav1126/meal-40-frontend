'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { ACTIONS } from '@plate40/config';
import { useAdminRestaurantsQuery, useUpdateRestaurantApprovalMutation } from '@plate40/state';
import { RestaurantApprovalStatus, type Restaurant } from '@plate40/types';
import { Badge, Button, Card, ErrorState, PageHeader, Skeleton } from '@plate40/ui';
import { DataTable } from '../../../components/data-table';

export default function AdminRestaurantsPage() {
  const {
    data = [],
    isLoading,
    isError,
  } = useAdminRestaurantsQuery(undefined, {
    pollingInterval: 15_000,
    refetchOnFocus: true,
  });
  const [update, state] = useUpdateRestaurantApprovalMutation();
  async function action(restaurantId: number, actionName: string) {
    try {
      await update({
        restaurantId,
        action: actionName,
        reason: actionName === ACTIONS.approve ? undefined : 'Updated by platform administrator',
      }).unwrap();
      const resultLabel =
        actionName === ACTIONS.approve
          ? 'approved'
          : actionName === ACTIONS.reject
            ? 'rejected'
            : 'suspended';
      toast.success(`Restaurant ${resultLabel} successfully`);
    } catch {
      toast.error('Unable to update this restaurant.');
    }
  }
  const columns: Array<ColumnDef<Restaurant>> = [
    { accessorKey: 'name', header: 'Restaurant' },
    { accessorKey: 'city', header: 'Location' },
    {
      accessorKey: 'openingStatus',
      header: 'Operations',
      cell: ({ row }) => (
        <Badge tone={row.original.openingStatus === 'OPEN' ? 'success' : 'warning'}>
          {row.original.openingStatus}
        </Badge>
      ),
    },
    {
      accessorKey: 'approvalStatus',
      header: 'Approval',
      cell: ({ row }) => (
        <Badge
          tone={
            row.original.approvalStatus === RestaurantApprovalStatus.APPROVED
              ? 'success'
              : row.original.approvalStatus === RestaurantApprovalStatus.REJECTED
                ? 'danger'
                : 'warning'
          }
        >
          {row.original.approvalStatus}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="table-actions">
          <Button
            disabled={
              state.isLoading || row.original.approvalStatus === RestaurantApprovalStatus.APPROVED
            }
            variant="operational"
            onClick={() => action(row.original.id, ACTIONS.approve)}
          >
            Approve
          </Button>
          <Button
            disabled={
              state.isLoading || row.original.approvalStatus === RestaurantApprovalStatus.REJECTED
            }
            variant="danger"
            onClick={() => action(row.original.id, ACTIONS.reject)}
          >
            Reject
          </Button>
          <Button
            disabled={
              state.isLoading || row.original.approvalStatus === RestaurantApprovalStatus.SUSPENDED
            }
            variant="secondary"
            onClick={() => action(row.original.id, ACTIONS.suspend)}
          >
            Suspend
          </Button>
        </div>
      ),
    },
  ];
  return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Restaurants & approvals"
        description="Review, approve, reject, or suspend partner kitchens."
      />
      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <ErrorState />
      ) : (
        <Card className="p-[1.15rem]">
          <DataTable
            data={data}
            columns={columns}
            emptyMessage="No restaurant applications found."
          />
        </Card>
      )}
    </main>
  );
}
