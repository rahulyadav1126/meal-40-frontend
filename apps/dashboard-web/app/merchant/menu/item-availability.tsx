'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUpdateMerchantMenuItemMutation } from '@plate40/state';
import type { MenuItem, ServiceInterval } from '@plate40/types';
import { Button, HoursEditor } from '@plate40/ui';

export function ItemAvailability({ item }: { item: MenuItem }) {
  const [hours, setHours] = useState<ServiceInterval[]>(item.serviceHours ?? []);
  const [update, { isLoading }] = useUpdateMerchantMenuItemMutation();
  async function save(data: { isAvailable?: boolean; soldOutUntil?: string | null; serviceHours?: ServiceInterval[] }) {
    try { await update({ itemId: Number(item.id), data }).unwrap(); toast.success('Item availability updated'); }
    catch (error) { toast.error((error as { data?: { message?: string } })?.data?.message ?? 'Unable to update item'); }
  }
  const soldOut = item.soldOutUntil && new Date(item.soldOutUntil) > new Date();
  return <div className="grid gap-2 min-w-48">
    <Button variant="secondary" disabled={isLoading} onClick={() => save({ isAvailable: !item.isAvailable })}>{item.isAvailable ? 'Available • turn off' : 'Unavailable • turn on'}</Button>
    {soldOut && <small>Sold out until {new Date(item.soldOutUntil!).toLocaleString()}</small>}
    <div className="flex gap-2"><Button variant="secondary" disabled={isLoading} onClick={() => save({ soldOutUntil: new Date(Date.now() + 60 * 60000).toISOString() })}>Pause 1h</Button>{soldOut && <Button variant="secondary" disabled={isLoading} onClick={() => save({ soldOutUntil: null })}>Clear pause</Button>}</div>
    <details className="p40-exception"><summary className="cursor-pointer">Serving hours</summary><p className="p40-muted">Leave empty to follow restaurant hours. Once configured, days without intervals are unavailable. Times use the outlet timezone.</p><HoursEditor value={hours} onChange={setHours} disabled={isLoading} /><div className="flex flex-wrap gap-2"><Button disabled={isLoading} onClick={() => save({ serviceHours: hours })}>Save hours</Button><Button variant="secondary" disabled={isLoading} onClick={() => { setHours([]); void save({ serviceHours: [] }); }}>Follow restaurant</Button></div></details>
  </div>;
}
