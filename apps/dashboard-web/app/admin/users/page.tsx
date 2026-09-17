'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { ACTIONS } from '@plate40/config';
import { useAdminUsersQuery, useUpdateUserStatusMutation } from '@plate40/state';
import { UserStatus, type User } from '@plate40/types';
import { Badge, Button, Card, ErrorState, PageHeader, Skeleton } from '@plate40/ui';
import { formatDate } from '@plate40/utils';
import { DataTable } from '../../../components/data-table';

export default function AdminUsersPage() {
  const { data = [], isLoading, isError } = useAdminUsersQuery();
  const [update, state] = useUpdateUserStatusMutation();
  const columns: Array<ColumnDef<User>> = [
    { accessorKey: 'name', header: 'User' }, { accessorKey: 'email', header: 'Email' }, { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge tone={row.original.status === UserStatus.ACTIVE ? 'success' : 'danger'}>{row.original.status}</Badge> },
    { accessorKey: 'createdAt', header: 'Joined', cell: ({ row }) => row.original.createdAt ? formatDate(row.original.createdAt) : '—' },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <Button disabled={state.isLoading} variant={row.original.status === UserStatus.BLOCKED ? 'secondary' : 'danger'} onClick={async () => { try { await update({ userId: row.original.id, action: row.original.status === UserStatus.BLOCKED ? ACTIONS.unblock : ACTIONS.block }).unwrap(); toast.success('User status updated'); } catch { toast.error('Unable to update the user.'); } }}>{row.original.status === UserStatus.BLOCKED ? 'Unblock' : 'Block'}</Button> },
  ];
  return <main className="dashboard-page"><PageHeader title="Customers & users" description="Role and account status management." />{isLoading ? <Skeleton /> : isError ? <ErrorState /> : <Card className="table-card"><DataTable data={data} columns={columns} /></Card>}</main>;
}
