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
    } catch {
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
    <main className="p40-container py-8 pb-16 min-h-[70vh]">
      <PageHeader
        title="Manage Addresses"
      />
      <div className="flex flex-col gap-8 w-full">
        {isLoading ? (
          <Skeleton />
        ) : isError ? (
          <ErrorState />
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
            <Card
              className="p-6 bg-white border border-p40-border rounded-none flex flex-col items-center justify-center cursor-pointer border-dashed min-h-[200px]"
              onClick={() => {
                handleCancelEdit();
                setIsFormVisible(true);
              }}
            >
              <Plus size={32} className="text-p40-brand mb-2" />
              <strong className="text-p40-brand">ADD NEW ADDRESS</strong>
            </Card>
            {data.map((address) => {
              const Icon = address.label === AddressLabel.HOME ? Home : address.label === AddressLabel.WORK ? Briefcase : MapPin;
              return (
                <Card key={address.id} className="p-6 bg-white border border-p40-border rounded-none flex flex-col">
                  <div className="flex items-start gap-4">
                    <Icon size={24} className="mt-[2px] text-[#3d4152]" />
                    <div className="flex-1">
                      <strong className="block text-[1.1rem] font-[800] text-[#1e293b] mb-2">{address.label}</strong>
                      <p className="m-0 text-[#3d4152] text-[0.95rem] leading-[1.5]">
                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                        <br />
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-6 pl-10">
                    <button onClick={() => handleEdit(address)} type="button" className="bg-none border-none text-[#fc8019] font-[800] text-[0.85rem] uppercase cursor-pointer p-0 tracking-[0.5px] hover:underline">EDIT</button>
                    <button onClick={() => handleDelete(address.id)} type="button" className="bg-none border-none text-[#fc8019] font-[800] text-[0.85rem] uppercase cursor-pointer p-0 tracking-[0.5px] hover:underline">DELETE</button>
                  </div>
                </Card>
              );
            })}
          </section>
        )}
        
        {isFormVisible && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCancelEdit}>
            <div className="fixed top-0 right-0 bottom-0 w-full sm:max-w-[480px] bg-white z-50 p-5 md:p-8 shadow-[-4px_0_24px_rgba(0,0,0,0.1)] overflow-y-auto animate-[slideIn_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="m-0">{editingId ? 'Edit address' : 'Add address'}</h2>
                <button type="button" className="bg-none border-none cursor-pointer p-2 text-p40-slate" onClick={handleCancelEdit}>
                  <X size={24} />
                </button>
              </div>
              <form className="grid gap-4" onSubmit={submit}>
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
                <div className="grid grid-cols-2 gap-4">
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
                <div className="flex gap-4 mt-4">
                  <Button disabled={createState.isLoading || updateState.isLoading} type="submit" className="flex-1">
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
