'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getStoredUser } from '@plate40/auth';
import { STORAGE_KEYS } from '@plate40/config';
import { useAddressesQuery, useCreateAddressMutation } from '@plate40/state';
import { AddressLabel } from '@plate40/types';
import {
  AddressAutocomplete,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
} from '@plate40/ui';

interface StoredLocation {
  latitude?: number | null;
  longitude?: number | null;
}

function initialAddress() {
  const user = getStoredUser();
  let coordinates = { latitude: '12.9716', longitude: '77.5946' };
  try {
    if (typeof window === 'undefined') throw new Error('Browser storage is unavailable');
    const stored = window.localStorage.getItem(STORAGE_KEYS.deliveryLocation);
    const location = stored ? (JSON.parse(stored) as StoredLocation) : null;
    if (location?.latitude != null && location.longitude != null) {
      coordinates = {
        latitude: String(location.latitude),
        longitude: String(location.longitude),
      };
    }
  } catch {
    // The address can still be entered if saved location data is unavailable.
  }
  return {
    label: AddressLabel.HOME,
    recipientName: user?.name ?? '',
    phone: user?.phone ?? '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    ...coordinates,
  };
}

function normalizeIndianPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return value.trim();
}

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'data' in error) {
    const message = (error as { data?: { message?: string } }).data?.message;
    if (message) return message;
  }
  return 'Could not save this address.';
}

export default function AddressesPage() {
  const { data = [], isLoading, isError } = useAddressesQuery();
  const [createAddress, state] = useCreateAddressMutation();
  const [draft, setDraft] = useState(initialAddress);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const phone = normalizeIndianPhone(draft.phone);
    if (!/^\+91[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    try {
      await createAddress({
        ...draft,
        recipientName: draft.recipientName.trim(),
        phone,
        addressLine1: draft.addressLine1.trim(),
        addressLine2: draft.addressLine2.trim() || undefined,
        landmark: draft.landmark.trim() || undefined,
        city: draft.city.trim(),
        state: draft.state.trim(),
        postalCode: draft.postalCode.trim(),
      }).unwrap();
      setDraft(initialAddress());
      toast.success('Address saved');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <main className="page-shell p40-container">
      <PageHeader
        title="Delivery addresses"
        description="Saved locations are verified against each kitchen's delivery radius."
      />
      <div className="address-page">
        {isLoading ? (
          <Skeleton />
        ) : isError ? (
          <ErrorState />
        ) : (
          <section className="address-list">
            {data.length ? (
              data.map((address) => (
                <Card key={address.id}>
                  <strong>{address.label}</strong>
                  <span>
                    {address.recipientName} · {address.phone}
                  </span>
                  <p>
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                  </p>
                  <span>
                    {address.city}, {address.state} {address.postalCode}
                  </span>
                </Card>
              ))
            ) : (
              <EmptyState
                title="No addresses saved"
                description="Add your first delivery address using the form."
              />
            )}
          </section>
        )}
        <Card className="address-form">
          <h2>Add address</h2>
          <form className="form-grid" onSubmit={submit}>
            <label className="p40-field">
              <span className="p40-label">Label</span>
              <select
                className="p40-input"
                value={draft.label}
                onChange={(event) =>
                  setDraft({ ...draft, label: event.target.value as AddressLabel })
                }
              >
                {Object.values(AddressLabel).map((label) => (
                  <option key={label}>{label}</option>
                ))}
              </select>
            </label>
            <label className="p40-field">
              <span className="p40-label">Recipient name</span>
              <Input
                required
                maxLength={120}
                autoComplete="name"
                placeholder="Person receiving the order"
                value={draft.recipientName}
                onChange={(event) => setDraft({ ...draft, recipientName: event.target.value })}
              />
            </label>
            <label className="p40-field">
              <span className="p40-label">Phone number</span>
              <Input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={draft.phone}
                onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
              />
            </label>
            <label className="p40-field">
              <span className="p40-label">Address line</span>
              <AddressAutocomplete
                required
                maxLength={255}
                placeholder="House number, street, area or landmark"
                value={draft.addressLine1}
                onValueChange={(value) =>
                  setDraft((current) => ({ ...current, addressLine1: value }))
                }
                onAddressSelect={(address) =>
                  setDraft((current) => ({
                    ...current,
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2 || current.addressLine2,
                    city: address.city,
                    state: address.state,
                    postalCode: address.postalCode,
                    latitude: String(address.latitude),
                    longitude: String(address.longitude),
                  }))
                }
                onError={(message) => toast.error(message)}
              />
            </label>
            <label className="p40-field">
              <span className="p40-label">Landmark (optional)</span>
              <Input
                maxLength={120}
                placeholder="Near market, school, etc."
                value={draft.landmark}
                onChange={(event) => setDraft({ ...draft, landmark: event.target.value })}
              />
            </label>
            <label className="p40-field">
              <span className="p40-label">City</span>
              <Input
                required
                maxLength={100}
                autoComplete="address-level2"
                value={draft.city}
                onChange={(event) => setDraft({ ...draft, city: event.target.value })}
              />
            </label>
            <label className="p40-field">
              <span className="p40-label">State</span>
              <Input
                required
                maxLength={100}
                autoComplete="address-level1"
                value={draft.state}
                onChange={(event) => setDraft({ ...draft, state: event.target.value })}
              />
            </label>
            <label className="p40-field">
              <span className="p40-label">Postal code</span>
              <Input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="postal-code"
                value={draft.postalCode}
                onChange={(event) => setDraft({ ...draft, postalCode: event.target.value })}
              />
            </label>
            <Button disabled={state.isLoading} type="submit">
              {state.isLoading ? 'Saving...' : 'Save address'}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
