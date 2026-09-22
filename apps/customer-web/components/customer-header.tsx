'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  CircleHelp,
  Percent,
  UtensilsCrossed,
  Home,
} from 'lucide-react';
import { ROUTES, STORAGE_KEYS } from '@plate40/config';
import { clearSession, SESSION_CHANGED_EVENT } from '@plate40/auth';
import { baseApi, setSelectedLocation, useAppDispatch, useAppSelector, useCartsQuery, useCartItemsQuery, useAddressesQuery } from '@plate40/state';
import { UserRole, AddressLabel, type User } from '@plate40/types';
import { AddressAutocomplete, Button, type AddressSelection } from '@plate40/ui';

interface StoredLocation {
  label: string;
  tag?: AddressLabel;
  latitude: number | null;
  longitude: number | null;
  source: 'manual' | 'device' | 'saved';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<AddressSelection | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = pathname === ROUTES.customer.home;
  const isTransparent = isHome && !isScrolled;

  const { data: addresses } = useAddressesQuery(undefined, { skip: !user });

  const { data: carts } = useCartsQuery();
  const cartId = carts?.[0]?.id;
  const { data: cartItems } = useCartItemsQuery(cartId as number, { skip: !cartId });
  const cartItemCount = cartItems?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;

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
    dispatch(setSelectedLocation(JSON.stringify({ label: value.label, tag: value.tag })));
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
    <header className={`customer-header ${isTransparent ? 'customer-header--transparent' : ''}`}>
      <div className="customer-header__inner p40-container">
        <div className="header-left">
          <Link className="brand-logo" href={ROUTES.customer.home}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Plate40" className="brand-logo-img" />
          </Link>

          <div className="location-selector-wrapper" ref={selectorRef}>
            {(() => {
              if (!location || location === 'Choose location') return null;
              try {
                const parsed = JSON.parse(location) as { tag?: string };
                if (parsed.tag) {
                  return <div className="location-tag">{parsed.tag}</div>;
                }
              } catch {
                // Not JSON, ignore
              }
              return null;
            })()}
            <div className="location-selector">
              <button
                className="location-button"
                type="button"
                title="Change delivery location"
                aria-expanded={open}
                aria-controls="delivery-location-panel"
                onClick={() => {
                  setOpen((value) => !value);
                  setError(null);
                }}
              >
                <div className="location-text">
                  {(() => {
                    if (!location || location === 'Choose location') return 'Select Location';
                    try {
                      const parsed = JSON.parse(location) as { label: string };
                      return <span>{parsed.label}</span>;
                    } catch {
                      return location;
                    }
                  })()}
                </div>
                <ChevronDown className={open ? 'is-open' : ''} size={15} color="var(--p40-brand)" />
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
              {error ? <p className="location-error">{error}</p> : null}

              {/* The new saved addresses section */}
              {user && addresses && addresses.length > 0 && (
                <div className="saved-addresses-section">
                  <div className="saved-addresses-header">SAVED ADDRESSES</div>
                  {addresses.map((address) => (
                    <div className="saved-address-item" key={address.id}>
                      <button
                        className="saved-address-btn"
                        type="button"
                        onClick={() => {
                          saveLocation({
                            label: `${address.addressLine1}, ${address.city}, ${address.state}, ${address.postalCode}`,
                            tag: address.label,
                            latitude: address.latitude ? parseFloat(address.latitude) : null,
                            longitude: address.longitude ? parseFloat(address.longitude) : null,
                            source: 'saved',
                          });
                        }}
                      >
                        <div className="saved-address-icon">
                          {address.label === AddressLabel.HOME ? <UserRound size={20} /> : address.label === AddressLabel.WORK ? <ShoppingBag size={20} /> : <MapPin size={20} />}
                        </div>
                        <div className="saved-address-content">
                          <strong>{address.label.charAt(0).toUpperCase() + address.label.slice(1).toLowerCase()}</strong>
                          <p>{address.addressLine1}, {address.city}, {address.state}, India</p>
                        </div>
                      </button>
                    </div>
                  ))}
                  <Link href={ROUTES.customer.addresses} className="saved-address-view-more" onClick={() => setOpen(false)}>
                    VIEW MORE
                  </Link>
                </div>
              )}

              <div className="location-divider">
                <span>or enter manually</span>
              </div>
              <form onSubmit={submitManualLocation}>
                <label className="p40-field">
                  <span className="p40-label">Search for area, street name..</span>
                  <AddressAutocomplete
                    autoFocus
                    required
                    placeholder="e.g. House 42, Sector 67, Mohali"
                    value={manualLocation}
                    onValueChange={(value) => {
                      setManualLocation(value);
                      if (!value) setSelectedAddress(null);
                    }}
                    onAddressSelect={setSelectedAddress}
                  />
                </label>
                <Button type="submit" disabled={!selectedAddress && !manualLocation.trim()} variant="primary" style={{ marginTop: '0.75rem', width: '100%' }}>
                  Confirm Location
                </Button>
              </form>
              <p className="location-privacy">
                Your selection is stored only on this device so it is ready on your next visit.
              </p>
            </section>
          ) : null}
        </div>
        </div>
        </div>

        <nav className="header-right-nav" aria-label="Primary">
          <Link href={ROUTES.customer.home} className="nav-item">
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link href={ROUTES.customer.restaurants} className="nav-item">
            <UtensilsCrossed size={18} />
            <span>Restaurants</span>
          </Link>
          <Link href={ROUTES.customer.restaurants} className="nav-item">
            <Search size={18} />
            <span>Search</span>
          </Link>
          <Link href={ROUTES.customer.offers} className="nav-item offers-link">
            <Percent size={18} />
            <span>Offers <span className="new-badge">NEW</span></span>
          </Link>
          <Link href={ROUTES.customer.help} className="nav-item">
            <CircleHelp size={18} />
            <span>Help</span>
          </Link>
          {/* User icon with dropdown */}
          <div className="header-user-menu" ref={userMenuRef}>
            <button
              type="button"
              className="nav-item user-icon-btn"
              aria-label="User menu"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <UserRound size={20} />
              {user && <span className="user-online-dot" />}
            </button>

            {userMenuOpen && (
              <div className="user-dropdown">
                {user ? (
                  <>
                    <div className="user-dropdown-header">
                      <UserRound size={28} className="user-dropdown-avatar" />
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <div className="user-dropdown-divider" />
                    <Link href={ROUTES.customer.profile} className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <UserRound size={16} /> My Profile
                    </Link>
                    <Link href={ROUTES.customer.orders} className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <ShoppingBag size={16} /> My Orders
                    </Link>
                    <Link href={ROUTES.customer.addresses} className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <MapPin size={16} /> Addresses
                    </Link>
                    <div className="user-dropdown-divider" />
                    <button type="button" className="user-dropdown-item user-dropdown-signout" onClick={() => { setUserMenuOpen(false); signOut(); }}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={ROUTES.customer.login} className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <UserRound size={16} /> Sign In
                    </Link>
                    <Link href={ROUTES.customer.register} className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <UserRound size={16} /> Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart icon only with badge */}
          <Link className="nav-item cart-link" href={ROUTES.customer.cart} aria-label="Cart">
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} strokeWidth={2.5} />
              {cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </div>
          </Link>
        </nav>
        <button className="mobile-menu" aria-label="Open menu" type="button">
          <Menu />
        </button>
      </div>
    </header>
  );
}
