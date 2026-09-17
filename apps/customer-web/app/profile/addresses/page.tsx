'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAddressesQuery, useCreateAddressMutation } from '@plate40/state';
import { AddressLabel } from '@plate40/types';
import { Button, Card, EmptyState, ErrorState, Input, PageHeader, Skeleton } from '@plate40/ui';

const INITIAL_ADDRESS = { label: AddressLabel.HOME, addressLine1: '', addressLine2: '', city: 'Bengaluru', state: 'Karnataka', postalCode: '', latitude: '12.9716', longitude: '77.5946' };

export default function AddressesPage() {
  const { data = [], isLoading, isError } = useAddressesQuery();
  const [createAddress, state] = useCreateAddressMutation();
  const [draft, setDraft] = useState(INITIAL_ADDRESS);
  async function submit(event: React.FormEvent) { event.preventDefault(); try { await createAddress(draft).unwrap(); setDraft(INITIAL_ADDRESS); toast.success('Address saved'); } catch { toast.error('Could not save this address.'); } }
  return <main className="page-shell p40-container"><PageHeader title="Delivery addresses" description="Saved locations are verified against each kitchen's delivery radius." /><div className="address-page">{isLoading ? <Skeleton /> : isError ? <ErrorState /> : <section className="address-list">{data.length ? data.map((address) => <Card key={address.id}><strong>{address.label}</strong><p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p><span>{address.city}, {address.state} {address.postalCode}</span></Card>) : <EmptyState title="No addresses saved" description="Add your first delivery address using the form." />}</section>}<Card className="address-form"><h2>Add address</h2><form className="form-grid" onSubmit={submit}><label className="p40-field"><span className="p40-label">Label</span><select className="p40-input" value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value as AddressLabel })}>{Object.values(AddressLabel).map((label) => <option key={label}>{label}</option>)}</select></label><label className="p40-field"><span className="p40-label">Address line</span><Input required value={draft.addressLine1} onChange={(event) => setDraft({ ...draft, addressLine1: event.target.value })} /></label><label className="p40-field"><span className="p40-label">City</span><Input required value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} /></label><label className="p40-field"><span className="p40-label">State</span><Input required value={draft.state} onChange={(event) => setDraft({ ...draft, state: event.target.value })} /></label><label className="p40-field"><span className="p40-label">Postal code</span><Input required pattern="[0-9]{6}" value={draft.postalCode} onChange={(event) => setDraft({ ...draft, postalCode: event.target.value })} /></label><Button disabled={state.isLoading} type="submit">{state.isLoading ? 'Saving...' : 'Save address'}</Button></form></Card></div></main>;
}
