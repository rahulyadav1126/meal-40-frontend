'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  useAdminDeliveriesQuery,
  useAdminDeliveryActionMutation,
  useAdminDeliveryPartnersQuery,
} from '@plate40/state';
import { DeliveryPartnerApprovalStatus, type DeliveryPartner } from '@plate40/types';
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@plate40/ui';
import { DataTable } from '../../../components/data-table';

export default function AdminDeliveryPage() {
  const partners = useAdminDeliveryPartnersQuery(undefined, {
    pollingInterval: 15_000,
    refetchOnFocus: true,
  });
  const deliveries = useAdminDeliveriesQuery(undefined, { pollingInterval: 15_000 });
  const [update, state] = useAdminDeliveryActionMutation();

  async function action(id: number, name: string, document = false) {
    try {
      await update({ id, action: name, document }).unwrap();
      toast.success(
        document
          ? `Document ${name === 'verify' ? 'verified' : 'rejected'}`
          : `Delivery partner ${name === 'approve' ? 'approved' : name === 'reject' ? 'rejected' : 'suspended'}`,
      );
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ??
          'Unable to update this delivery partner.',
      );
    }
  }

  const columns: Array<ColumnDef<DeliveryPartner>> = [
    {
      id: 'partner',
      header: 'Delivery partner',
      cell: ({ row }) => (
        <div>
          <strong>{row.original.user.name}</strong>
          <small style={{ display: 'block' }}>{row.original.user.phone}</small>
          <small>{row.original.user.email}</small>
        </div>
      ),
    },
    {
      id: 'vehicle',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <strong>{row.original.vehicleNumber}</strong>
          <small style={{ display: 'block' }}>{row.original.vehicleType}</small>
        </div>
      ),
    },
    {
      id: 'documents',
      header: 'Documents',
      cell: ({ row }) => (
        <div style={{ display: 'grid', gap: 8 }}>
          {row.original.documents?.length ? (
            row.original.documents.map((document) => (
              <div key={document.id}>
                <strong>{document.type}</strong>
                <small style={{ display: 'block' }}>{document.documentNumber}</small>
                <Badge
                  tone={
                    document.status === 'VERIFIED'
                      ? 'success'
                      : document.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {document.status}
                </Badge>
                <div className="table-actions" style={{ marginTop: 6 }}>
                  <Button
                    variant="operational"
                    disabled={state.isLoading || document.status === 'VERIFIED'}
                    onClick={() => action(document.id, 'verify', true)}
                  >
                    Verify
                  </Button>
                  <Button
                    variant="danger"
                    disabled={state.isLoading || document.status === 'REJECTED'}
                    onClick={() => action(document.id, 'reject', true)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <Badge tone="warning">No document</Badge>
          )}
        </div>
      ),
    },
    {
      id: 'availability',
      header: 'Availability',
      cell: ({ row }) => (
        <Badge tone={row.original.isOnline ? 'success' : 'warning'}>
          {row.original.isOnline ? 'ONLINE' : 'OFFLINE'}
        </Badge>
      ),
    },
    {
      accessorKey: 'approvalStatus',
      header: 'Approval',
      cell: ({ row }) => (
        <Badge
          tone={
            row.original.approvalStatus === DeliveryPartnerApprovalStatus.APPROVED
              ? 'success'
              : row.original.approvalStatus === DeliveryPartnerApprovalStatus.PENDING
                ? 'warning'
                : 'danger'
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
            variant="operational"
            disabled={
              state.isLoading ||
              row.original.approvalStatus === DeliveryPartnerApprovalStatus.APPROVED
            }
            onClick={() => action(row.original.id, 'approve')}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            disabled={
              state.isLoading ||
              row.original.approvalStatus === DeliveryPartnerApprovalStatus.REJECTED
            }
            onClick={() => action(row.original.id, 'reject')}
          >
            Reject
          </Button>
          <Button
            variant="secondary"
            disabled={
              state.isLoading ||
              row.original.approvalStatus === DeliveryPartnerApprovalStatus.SUSPENDED
            }
            onClick={() => action(row.original.id, 'suspend')}
          >
            Suspend
          </Button>
        </div>
      ),
    },
  ];

  return (
    <main className="dashboard-page">
      <PageHeader
        title="Delivery partners & approvals"
        description="Review documents and approve, reject, or suspend delivery partners."
      />
      {partners.isLoading ? (
        <Skeleton />
      ) : partners.isError ? (
        <ErrorState />
      ) : (
        <Card className="table-card">
          <DataTable
            data={partners.data ?? []}
            columns={columns}
            emptyMessage="No delivery partner applications found."
          />
        </Card>
      )}
      <h2 style={{ marginTop: 28 }}>Current delivery monitoring</h2>
      {deliveries.data?.length ? (
        <div className="delivery-grid">
          {deliveries.data.slice(0, 20).map((delivery) => (
            <Card key={delivery.id}>
              <strong>#{delivery.order?.orderNumber}</strong>
              <p>{delivery.order?.restaurant?.name}</p>
              <Badge tone={delivery.status === 'DELIVERED' ? 'success' : 'indigo'}>
                {delivery.status}
              </Badge>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No deliveries"
          description="Ready and assigned deliveries will appear here."
        />
      )}
    </main>
  );
}
