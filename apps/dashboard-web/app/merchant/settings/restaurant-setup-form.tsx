'use client';

import { useState, type FormEvent } from 'react';
import { Crosshair, LoaderCircle, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateMerchantRestaurantMutation } from '@plate40/state';
import { AddressAutocomplete, Button, Card, Input } from '@plate40/ui';

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

export function RestaurantSetupForm() {
  const [draft, setDraft] = useState(INITIAL);
  const [locating, setLocating] = useState(false);
  const [createRestaurant, state] = useCreateMerchantRestaurantMutation();
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
      await createRestaurant({
        ...draft,
        description: draft.description.trim() || undefined,
        email: draft.email.trim() || undefined,
        addressLine2: draft.addressLine2.trim() || undefined,
      }).unwrap();
      toast.success('Restaurant profile created. You can now add menu items.');
    } catch (error) {
      toast.error(apiMessage(error) ?? 'Could not create the restaurant profile.');
    }
  };

  return (
    <Card className="restaurant-setup-card">
      <div className="restaurant-setup-card__intro">
        <span>
          <Store size={24} />
        </span>
        <div>
          <span className="section-kicker">FIRST-TIME SETUP</span>
          <h2>Create your restaurant profile</h2>
          <p>
            Add the basic store details required before building your menu. Your restaurant goes
            becomes visible to customers after a platform administrator approves it.
          </p>
        </div>
      </div>
      <form className="restaurant-setup-form" onSubmit={submit}>
        <label className="p40-field">
          <span className="p40-label">Restaurant name</span>
          <Input
            required
            minLength={2}
            maxLength={160}
            placeholder="e.g. Rahul's Kitchen"
            value={draft.name}
            onChange={(event) => update('name', event.target.value)}
          />
        </label>
        <label className="p40-field">
          <span className="p40-label">Business phone</span>
          <Input
            required
            type="tel"
            placeholder="+919876543210"
            value={draft.phone}
            onChange={(event) => update('phone', event.target.value)}
          />
        </label>
        <label className="p40-field">
          <span className="p40-label">
            Business email <small>Optional</small>
          </span>
          <Input
            type="email"
            placeholder="restaurant@example.com"
            value={draft.email}
            onChange={(event) => update('email', event.target.value)}
          />
        </label>
        <label className="p40-field restaurant-setup-form__wide">
          <span className="p40-label">
            Description <small>Optional</small>
          </span>
          <textarea
            className="p40-input restaurant-setup-form__textarea"
            maxLength={2000}
            placeholder="Tell customers what makes your food special..."
            value={draft.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </label>
        <label className="p40-field restaurant-setup-form__wide">
          <span className="p40-label">Address</span>
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
        <label className="p40-field">
          <span className="p40-label">
            Address line 2 <small>Optional</small>
          </span>
          <Input
            maxLength={255}
            placeholder="Floor or landmark"
            value={draft.addressLine2}
            onChange={(event) => update('addressLine2', event.target.value)}
          />
        </label>
        <label className="p40-field">
          <span className="p40-label">City</span>
          <Input
            required
            maxLength={100}
            placeholder="Mohali"
            value={draft.city}
            onChange={(event) => update('city', event.target.value)}
          />
        </label>
        <label className="p40-field">
          <span className="p40-label">State</span>
          <Input
            required
            maxLength={100}
            placeholder="Punjab"
            value={draft.state}
            onChange={(event) => update('state', event.target.value)}
          />
        </label>
        <label className="p40-field">
          <span className="p40-label">Postal code</span>
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
        <label className="p40-field">
          <span className="p40-label">Latitude</span>
          <Input
            required
            inputMode="decimal"
            placeholder="30.7046"
            value={draft.latitude}
            onChange={(event) => update('latitude', event.target.value)}
          />
        </label>
        <label className="p40-field">
          <span className="p40-label">Longitude</span>
          <Input
            required
            inputMode="decimal"
            placeholder="76.7179"
            value={draft.longitude}
            onChange={(event) => update('longitude', event.target.value)}
          />
        </label>
        <label className="p40-field">
          <span className="p40-label">Delivery radius</span>
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
        <label className="p40-field">
          <span className="p40-label">Minimum order</span>
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
        <footer className="restaurant-setup-form__footer">
          <Button type="submit" disabled={state.isLoading}>
            {state.isLoading ? (
              <>
                <LoaderCircle className="menu-spinner" size={17} />
                Creating profile...
              </>
            ) : (
              'Create restaurant profile'
            )}
          </Button>
        </footer>
      </form>
    </Card>
  );
}
