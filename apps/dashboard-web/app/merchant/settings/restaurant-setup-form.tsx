'use client';

import { useState, type FormEvent } from 'react';
import { Crosshair, LoaderCircle, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateMerchantRestaurantMutation, useUpdateMerchantRestaurantMutation } from '@plate40/state';
import { AddressAutocomplete, Button, Card, CuisinePicker, Input } from '@plate40/ui';
import type { Cuisine, Restaurant } from '@plate40/types';

const INITIAL = {
  name: '',
  description: '',
  phone: '+91',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  latitude: '',
  longitude: '',
  deliveryRadiusKm: '5',
  minimumOrderAmount: '0',
};

function apiMessage(error: unknown) {
  if (typeof error === 'object' && error && 'data' in error)
    return (error as { data?: { message?: string } }).data?.message;
  return undefined;
}

export function RestaurantSetupForm({ restaurant, onCancel }: { restaurant?: Restaurant, onCancel?: () => void }) {
  const [cuisines, setCuisines] = useState<Cuisine[]>(restaurant?.cuisines ?? []);
  const [draft, setDraft] = useState(
    restaurant
      ? {
          name: restaurant.name,
          description: restaurant.description || '',
          phone: restaurant.phone ?? '',
          email: restaurant.email ?? '',
          addressLine1: restaurant.addressLine1 || '',
          addressLine2: restaurant.addressLine2 ?? '',
          city: restaurant.city || '',
          state: restaurant.state || '',
          postalCode: restaurant.postalCode ?? '',
          latitude: restaurant.latitude ?? '',
          longitude: restaurant.longitude ?? '',
          deliveryRadiusKm: restaurant.deliveryRadiusKm,
          minimumOrderAmount: restaurant.minimumOrderAmount,
        }
      : INITIAL
  );
  const [locating, setLocating] = useState(false);
  const [createRestaurant, createState] = useCreateMerchantRestaurantMutation();
  const [updateRestaurant, updateState] = useUpdateMerchantRestaurantMutation();
  const isLoading = createState.isLoading || updateState.isLoading;

  const update = (key: keyof typeof draft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const useCurrentCoordinates = () => {
    if (!navigator.geolocation) {
      toast.error('Location detection is not supported by this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setDraft((current) => ({
          ...current,
          latitude: coords.latitude.toFixed(7),
          longitude: coords.longitude.toFixed(7),
        }));
        setLocating(false);
        toast.success('Store coordinates detected');
      },
      () => {
        setLocating(false);
        toast.error('Could not detect your location. Enter the coordinates manually.');
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        ...draft,
        cuisines,
        description: draft.description.trim() || undefined,
        email: draft.email?.trim() || undefined,
        addressLine2: draft.addressLine2?.trim() || undefined,
      };
      
      if (restaurant) {
        // We don't send the phone number when updating, since the input is hidden
        const { phone, ...updatePayload } = payload;
        await updateRestaurant({ id: restaurant.id, ...updatePayload }).unwrap();
        toast.success('Restaurant profile updated successfully.');
        if (onCancel) onCancel();
      } else {
        await createRestaurant(payload).unwrap();
        toast.success('Restaurant profile created. You can now add menu items.');
        onCancel?.();
      }
    } catch (error) {
      toast.error(apiMessage(error) ?? (restaurant ? 'Could not update profile.' : 'Could not create the restaurant profile.'));
    }
  };

  return (
    <Card className="restaurant-setup-card">
      <div className="restaurant-setup-card__intro">
        <span>
          <Store size={24} />
        </span>
        <div>
          <span className="section-kicker">{restaurant ? 'EDIT PROFILE' : 'FIRST-TIME SETUP'}</span>
          <h2>{restaurant ? 'Edit your restaurant profile' : 'Create your restaurant profile'}</h2>
          <p>
            {restaurant 
              ? 'Update your store details and location. Changes may require admin re-approval if significant.' 
              : 'Add the basic store details required before building your menu. Your restaurant goes becomes visible to customers after a platform administrator approves it.'}
          </p>
        </div>
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start" onSubmit={submit}>
        <CuisinePicker value={cuisines} onChange={setCuisines} disabled={isLoading} />
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">Restaurant name</span>
          <Input
            required
            minLength={2}
            maxLength={160}
            placeholder="e.g. Rahul's Kitchen"
            value={draft.name}
            onChange={(event) => update('name', event.target.value)}
          />
        </label>
        {!restaurant && (
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Business phone</span>
            <Input
              required
              type="tel"
              placeholder="+919876543210"
              value={draft.phone}
              onChange={(event) => update('phone', event.target.value)}
            />
          </label>
        )}
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">
            Business email <small>Optional</small>
          </span>
          <Input
            type="email"
            placeholder="restaurant@example.com"
            value={draft.email}
            onChange={(event) => update('email', event.target.value)}
          />
        </label>
        <label className="grid gap-1 md:col-span-2">
          <span className="font-semibold text-sm text-[#06402b]">
            Description <small>Optional</small>
          </span>
          <textarea
            className="w-full min-h-[120px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#fc8019] focus:ring-1 focus:ring-[#fc8019] transition-all resize-y text-[#06402b] placeholder:text-slate-400"
            maxLength={2000}
            placeholder="Tell customers what makes your food special..."
            value={draft.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </label>
        <label className="grid gap-1 md:col-span-2">
          <span className="font-semibold text-sm text-[#06402b]">Address</span>
          <AddressAutocomplete
            required
            maxLength={255}
            placeholder="Shop or house number, street, area or landmark"
            value={draft.addressLine1}
            onValueChange={(value) => update('addressLine1', value)}
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
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">
            Address line 2 <small>Optional</small>
          </span>
          <Input
            maxLength={255}
            placeholder="Floor or landmark"
            value={draft.addressLine2}
            onChange={(event) => update('addressLine2', event.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">City</span>
          <Input
            required
            maxLength={100}
            placeholder="Mohali"
            value={draft.city}
            onChange={(event) => update('city', event.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">State</span>
          <Input
            required
            maxLength={100}
            placeholder="Punjab"
            value={draft.state}
            onChange={(event) => update('state', event.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">Postal code</span>
          <Input
            required
            maxLength={20}
            inputMode="numeric"
            placeholder="160062"
            value={draft.postalCode}
            onChange={(event) => update('postalCode', event.target.value)}
          />
        </label>
        <div className="restaurant-coordinates restaurant-setup-form__wide">
          <div>
            <strong>Store coordinates</strong>
            <p>Used to calculate whether customers are inside your delivery radius.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={useCurrentCoordinates}
            disabled={locating}
          >
            {locating ? (
              <LoaderCircle className="menu-spinner" size={17} />
            ) : (
              <Crosshair size={17} />
            )}
            {locating ? 'Detecting...' : 'Use current location'}
          </Button>
        </div>
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">Latitude</span>
          <Input
            required
            inputMode="decimal"
            placeholder="30.7046"
            value={draft.latitude}
            onChange={(event) => update('latitude', event.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">Longitude</span>
          <Input
            required
            inputMode="decimal"
            placeholder="76.7179"
            value={draft.longitude}
            onChange={(event) => update('longitude', event.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">Delivery radius</span>
          <span className="prep-input">
            <Input
              required
              inputMode="decimal"
              value={draft.deliveryRadiusKm}
              onChange={(event) => update('deliveryRadiusKm', event.target.value)}
            />
            <span>km</span>
          </span>
        </label>
        <label className="grid gap-1">
          <span className="font-semibold text-sm text-[#06402b]">Minimum order</span>
          <span className="money-input">
            <span>₹</span>
            <Input
              required
              inputMode="decimal"
              value={draft.minimumOrderAmount}
              onChange={(event) => update('minimumOrderAmount', event.target.value)}
            />
          </span>
        </label>
        <footer className="flex flex-col sm:flex-row gap-3 pt-6 md:col-span-2 sm:justify-end">
          {restaurant && onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <LoaderCircle className="menu-spinner" size={17} />
                Saving...
              </>
            ) : restaurant ? (
              'Save changes'
            ) : (
              'Create restaurant profile'
            )}
          </Button>
        </footer>
      </form>
    </Card>
  );
}
