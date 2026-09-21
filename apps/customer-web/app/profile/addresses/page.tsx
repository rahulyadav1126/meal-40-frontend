'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getStoredUser } from '@plate40/auth';
import { STORAGE_KEYS } from '@plate40/config';
import { useAddressesQuery, useCreateAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation } from '@plate40/state';
import { AddressLabel, type Address } from '@plate40/types';
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
import { Home, Briefcase, MapPin, Plus, X } from 'lucide-react';

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
  const [createAddress, createState] = useCreateAddressMutation();
  const [updateAddress, updateState] = useUpdateAddressMutation();
  const [draft, setDraft] = useState(initialAddress);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deleteAddress] = useDeleteAddressMutation();

  async function handleDelete(id: number) {
    try {
      await deleteAddress(id).unwrap();
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  }

  function handleEdit(address: Address) {
    setEditingId(address.id);
    setDraft({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      latitude: address.latitude?.toString(),
      longitude: address.longitude?.toString(),
    });
    setIsFormVisible(true);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setDraft(initialAddress());
    setIsFormVisible(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const phone = normalizeIndianPhone(draft.phone);
    if (!/^\+91[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    try {
      const payload = {
        ...draft,
        recipientName: draft.recipientName.trim(),
        phone,
        addressLine1: draft.addressLine1.trim(),
        addressLine2: draft.addressLine2.trim() || undefined,
        landmark: draft.landmark.trim() || undefined,
        city: draft.city.trim(),
        state: draft.state.trim(),
        postalCode: draft.postalCode.trim(),
      };

      if (editingId) {
        await updateAddress({ id: editingId, data: payload }).unwrap();
        toast.success('Address updated');
      } else {
        await createAddress(payload).unwrap();
        toast.success('Address saved');
      }

      setEditingId(null);
      setDraft(initialAddress());
      setIsFormVisible(false);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <main className="page-shell p40-container">
      <PageHeader
        title="Manage Addresses"
      />
      <div className="address-page">
        {isLoading ? (
          <Skeleton />
        ) : isError ? (
          <ErrorState />
        ) : (
          <section className="address-list">
            <Card
              className="address-card"
              style={{ justifyContent: 'center', alignItems: 'center', cursor: 'pointer', borderStyle: 'dashed', minHeight: '200px' }}
              onClick={() => {
                handleCancelEdit();
                setIsFormVisible(true);
              }}
            >
              <Plus size={32} style={{ color: 'var(--p40-brand)', marginBottom: '0.5rem' }} />
              <strong style={{ color: 'var(--p40-brand)' }}>ADD NEW ADDRESS</strong>
            </Card>
            {data.map((address) => {
              const Icon = address.label === AddressLabel.HOME ? Home : address.label === AddressLabel.WORK ? Briefcase : MapPin;
              return (
                <Card key={address.id} className="address-card p40-card">
                  <div className="address-card-header">
                    <Icon size={24} className="address-card-icon" />
                    <div className="address-card-content">
                      <strong>{address.label}</strong>
                      <p>
                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                        <br />
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                  </div>
                  <div className="address-card-actions">
                    <button onClick={() => handleEdit(address)} type="button">EDIT</button>
                    <button onClick={() => handleDelete(address.id)} type="button">DELETE</button>
                  </div>
                </Card>
              );
            })}
          </section>
        )}
        
        {isFormVisible && (
          <div className="address-slide-over-overlay" onClick={handleCancelEdit}>
            <div className="address-slide-over" onClick={(e) => e.stopPropagation()}>
              <div className="address-slide-over-header">
                <h2>{editingId ? 'Edit address' : 'Add address'}</h2>
                <button type="button" className="address-slide-over-close" onClick={handleCancelEdit}>
                  <X size={24} />
                </button>
              </div>
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
                    maxLength={255}
                    placeholder="e.g. Near Apollo Hospital"
                    value={draft.landmark}
                    onChange={(event) => setDraft({ ...draft, landmark: event.target.value })}
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label className="p40-field">
                    <span className="p40-label">City</span>
                    <Input
                      required
                      maxLength={120}
                      autoComplete="address-level2"
                      placeholder="City"
                      value={draft.city}
                      onChange={(event) => setDraft({ ...draft, city: event.target.value })}
                    />
                  </label>
                  <label className="p40-field">
                    <span className="p40-label">State</span>
                    <Input
                      required
                      maxLength={120}
                      autoComplete="address-level1"
                      placeholder="State"
                      value={draft.state}
                      onChange={(event) => setDraft({ ...draft, state: event.target.value })}
                    />
                  </label>
                </div>
                <label className="p40-field">
                  <span className="p40-label">PIN code</span>
                  <Input
                    required
                    maxLength={20}
                    autoComplete="postal-code"
                    placeholder="6 digit PIN"
                    value={draft.postalCode}
                    onChange={(event) => setDraft({ ...draft, postalCode: event.target.value })}
                  />
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button disabled={createState.isLoading || updateState.isLoading} type="submit" style={{ flex: 1 }}>
                    {editingId 
                      ? (updateState.isLoading ? 'Updating...' : 'Update address')
                      : (createState.isLoading ? 'Saving...' : 'Save address')
                    }
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
