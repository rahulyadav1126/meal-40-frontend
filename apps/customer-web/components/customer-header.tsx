'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import {
  Check,
  ChevronDown,
  Crosshair,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  LogOut,
  X,
} from 'lucide-react';
import { ROUTES, STORAGE_KEYS } from '@plate40/config';
import { clearSession, SESSION_CHANGED_EVENT } from '@plate40/auth';
import { baseApi, setSelectedLocation, useAppDispatch, useAppSelector } from '@plate40/state';
import { UserRole, type User } from '@plate40/types';
import { AddressAutocomplete, Button, type AddressSelection } from '@plate40/ui';

interface StoredLocation {
  label: string;
  latitude: number | null;
  longitude: number | null;
  source: 'manual' | 'device';
}

function subscribeToSession(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(SESSION_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(SESSION_CHANGED_EVENT, callback);
  };
}

function sessionSnapshot() {
  return window.localStorage.getItem(STORAGE_KEYS.user);
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const query = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: 'json',
    addressdetails: '1',
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`, {
    headers: { 'Accept-Language': 'en' },
  });
  if (!response.ok) throw new Error('Unable to identify this location');
  const data = (await response.json()) as {
    display_name?: string;
    address?: {
      suburb?: string;
      neighbourhood?: string;
      road?: string;
      city?: string;
      town?: string;
      village?: string;
      state_district?: string;
      state?: string;
    };
  };
  const address = data.address ?? {};
  const area = address.suburb ?? address.neighbourhood ?? address.road;
  const city = address.city ?? address.town ?? address.village ?? address.state_district;
  return (
    [area, city].filter(Boolean).join(', ') ||
    data.display_name?.split(',').slice(0, 2).join(',') ||
    'Current location'
  );
}

export function CustomerHeader() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const rawUser = useSyncExternalStore(subscribeToSession, sessionSnapshot, () => null);
  const user = useMemo(() => {
    if (!rawUser) return null;
    try {
      const stored = JSON.parse(rawUser) as User;
      return stored.role === UserRole.CUSTOMER ? stored : null;
    } catch {
      return null;
    }
  }, [rawUser]);
  const location = useAppSelector((state) => state.client.selectedLocation);
  const selectorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<AddressSelection | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEYS.deliveryLocation);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as StoredLocation;
      if (parsed.label) dispatch(setSelectedLocation(parsed.label));
    } catch {
      window.localStorage.removeItem(STORAGE_KEYS.deliveryLocation);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeWithEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, [open]);

  const saveLocation = (value: StoredLocation) => {
    window.localStorage.setItem(STORAGE_KEYS.deliveryLocation, JSON.stringify(value));
    dispatch(setSelectedLocation(value.label));
    setManualLocation('');
    setSelectedAddress(null);
    setError(null);
    setOpen(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Location detection is not supported by this browser. Enter it manually below.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const label = await reverseGeocode(coords.latitude, coords.longitude);
          saveLocation({
            label,
            latitude: coords.latitude,
            longitude: coords.longitude,
            source: 'device',
          });
        } catch {
          setError(
            'We found your position but could not read the address. Please enter it manually.',
          );
        } finally {
          setLocating(false);
        }
      },
      (geolocationError) => {
        const denied = geolocationError.code === geolocationError.PERMISSION_DENIED;
        setError(
          denied
            ? 'Location access was denied. Allow it in your browser or enter a location manually.'
            : 'We could not detect your location. Please enter it manually.',
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 },
    );
  };

  const submitManualLocation = (event: FormEvent) => {
    event.preventDefault();
    const label = manualLocation.trim().replace(/\s+/g, ' ');
    if (label.length < 3) {
      setError('Enter an area, city, landmark, or complete address.');
      return;
    }
    saveLocation({
      label,
      latitude: selectedAddress ? selectedAddress.latitude : null,
      longitude: selectedAddress ? selectedAddress.longitude : null,
      source: 'manual',
    });
  };

  const signOut = () => {
    clearSession();
    dispatch(baseApi.util.resetApiState());
    router.replace(ROUTES.customer.home);
  };

  return (
    <header className="customer-header">
      <div className="customer-header__inner p40-container">
        <Link className="brand" href={ROUTES.customer.home}>
          <span className="brand__mark">P</span>
          <span>Plate40</span>
        </Link>

        <div className="location-selector" ref={selectorRef}>
          <button
            className="location-pill"
            type="button"
            title="Change delivery location"
            aria-expanded={open}
            aria-controls="delivery-location-panel"
            onClick={() => {
              setOpen((value) => !value);
              setError(null);
            }}
          >
            <MapPin size={17} />
            <span>
              Delivery to: <strong>{location}</strong>
            </span>
            <ChevronDown className={open ? 'is-open' : ''} size={15} />
          </button>
          {open ? (
            <section
              className="location-panel"
              id="delivery-location-panel"
              aria-label="Choose delivery location"
            >
              <header>
                <div>
                  <span>DELIVERY LOCATION</span>
                  <h2>Where should we deliver?</h2>
                </div>
                <button
                  type="button"
                  aria-label="Close location selector"
                  onClick={() => setOpen(false)}
                >
                  <X size={18} />
                </button>
              </header>
              <button
                className="detect-location"
                type="button"
                onClick={detectLocation}
                disabled={locating}
              >
                <span>
                  <Crosshair size={20} />
                </span>
                <div>
                  <strong>{locating ? 'Detecting your location…' : 'Use current location'}</strong>
                  <small>Use this device’s GPS for an accurate location</small>
                </div>
                {!locating ? <ChevronDown size={17} /> : <span className="location-loader" />}
              </button>
              <div className="location-divider">
                <span>or enter manually</span>
              </div>
              <form onSubmit={submitManualLocation}>
                <label className="p40-field">
                  <span className="p40-label">House number, street, area or landmark</span>
                  <AddressAutocomplete
                    autoFocus
                    required
                    placeholder="e.g. House 42, Sector 67, Mohali"
                    value={manualLocation}
                    onValueChange={(value) => {
                      setManualLocation(value);
                      setSelectedAddress(null);
                      setError(null);
                    }}
                    onAddressSelect={(address) => {
                      setSelectedAddress(address);
                      setManualLocation(address.formattedAddress);
                      setError(null);
                    }}
                    onError={setError}
                  />
                </label>
                {error ? (
                  <p className="location-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" disabled={!manualLocation.trim()}>
                  <Check size={17} />
                  Use this location
                </Button>
              </form>
              <p className="location-privacy">
                Your selection is stored only on this device so it is ready on your next visit.
              </p>
            </section>
          ) : null}
        </div>

        <label className="header-search">
          <Search size={17} aria-hidden />
          <input
            aria-label="Search meals and restaurants"
            placeholder="Search for dishes, thalis, combos..."
          />
        </label>
        <nav className="desktop-nav" aria-label="Primary">
          <Link href={ROUTES.customer.home}>Home</Link>
          <Link href={ROUTES.customer.restaurants}>Restaurants</Link>
          <Link href={ROUTES.customer.offers}>Offers</Link>
          <Link href={ROUTES.customer.orders}>Orders</Link>
        </nav>
        <div className="header-auth-actions">
          <Link
            className={`account-link ${user ? 'account-link--profile' : ''}`}
            href={user ? ROUTES.customer.profile : ROUTES.customer.login}
          >
            {user ? (
              <span className="account-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            ) : (
              <UserRound size={18} />
            )}
            <span>{user ? user.name.split(' ')[0] : 'Sign in'}</span>
          </Link>
          {user ? (
            <button className="header-signout" type="button" onClick={signOut}>
              <LogOut size={17} />
              <span>Sign out</span>
            </button>
          ) : (
            <Link className="header-signup" href={ROUTES.customer.register}>
              Sign up
            </Link>
          )}
        </div>
        <Link className="cart-link" href={ROUTES.customer.cart}>
          <ShoppingBag size={18} />
          <span>Cart</span>
        </Link>
        <button className="mobile-menu" aria-label="Open menu" type="button">
          <Menu />
        </button>
      </div>
    </header>
  );
}
