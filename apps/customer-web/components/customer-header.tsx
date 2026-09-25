'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  const cartItemCount = cartItems?.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0) || 0;

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
    <>
      <header
      className={`sticky top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color] duration-200 ${isTransparent
          ? 'bg-transparent backdrop-blur-[3px] border-transparent'
          : 'bg-[#fff7ed]/95 backdrop-blur-[10px] border-p40-border'
        }`}
    >
      <div className="p40-container min-h-[80px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-8 min-w-0">
          <Link className="inline-block transition-transform duration-200 hover:scale-105 shrink-0" href={ROUTES.customer.home}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Plate40" className="h-[40px] md:h-[58px] max-h-[58px] w-auto max-w-[140px] md:max-w-[200px] block object-contain" />
          </Link>

          <div className="flex items-center gap-2 min-w-0" ref={selectorRef}>
            {(() => {
              if (!location || location === 'Choose location') return null;
              let parsedTag: string | undefined;
              try {
                const parsed = JSON.parse(location) as { tag?: string };
                parsedTag = parsed.tag;
              } catch {
                // Not JSON, ignore
              }
              if (parsedTag) {
                return <div className="text-[#06402b] font-extrabold text-base uppercase border-b-[2.5px] border-[#06402b] pb-[3px] mr-1">{parsedTag}</div>;
              }
              return null;
            })()}
            <div className="relative">
              <button
                className="flex items-center gap-1 md:gap-[0.6rem] bg-[#f9f9f9] border-[1.5px] border-[#e0e0e0] rounded-full cursor-pointer py-1.5 md:py-[0.45rem] px-3 md:px-[0.9rem] transition-[border-color,background] duration-200 hover:border-[#fc8019] hover:bg-[#fff5ed] shrink-0"
                type="button"
                title="Change delivery location"
                aria-expanded={open}
                aria-controls="delivery-location-panel"
                onClick={() => {
                  setOpen((value) => !value);
                  setError(null);
                }}
              >
                <div className="flex items-center gap-[0.4rem] text-[#06402b] text-[0.85rem] md:text-[0.95rem] max-w-[120px] md:max-w-[320px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {(() => {
                    if (!location || location === 'Choose location') return 'Select Location';
                    let parsedLabel: string | undefined;
                    try {
                      const parsed = JSON.parse(location) as { label: string };
                      parsedLabel = parsed.label;
                    } catch {
                      parsedLabel = location;
                    }
                    return <span>{parsedLabel}</span>;
                  })()}
                </div>
                <ChevronDown className={`transition-transform duration-200 text-[#fc8019] ${open ? 'rotate-180' : ''}`} size={15} />
              </button>
              {open ? (
                <section
                  className="absolute top-[calc(100%+0.75rem)] left-0 w-[min(410px,calc(100vw-2rem))] p-[1.1rem] bg-white border border-p40-border rounded-2xl shadow-[0_20px_55px_rgb(15,23,42,0.18)] before:absolute before:-top-[7px] before:left-[42px] before:w-3 before:h-3 before:bg-white before:border-l before:border-t before:border-p40-border before:rotate-45"
                  id="delivery-location-panel"
                  aria-label="Choose delivery location"
                >
                  <header className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-p40-primary text-[0.66rem] font-[850] tracking-[0.1em]">DELIVERY LOCATION</span>
                      <h2 className="m-[0.2rem_0_0] text-[1.1rem]">Where should we deliver?</h2>
                    </div>
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center border border-p40-border rounded-lg bg-white text-slate-500 cursor-pointer"
                      aria-label="Close location selector"
                      onClick={() => setOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </header>
                  <button
                    className="w-full p-[0.85rem] flex items-center gap-[0.75rem] text-left border border-indigo-200 rounded-[11px] bg-indigo-50/50 text-p40-slate cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-70"
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                  >
                    <span className="w-[38px] h-[38px] flex-none grid place-items-center rounded-[10px] bg-indigo-100 text-indigo-600">
                      <Crosshair size={20} />
                    </span>
                    <div className="flex-1">
                      <strong className="block text-[0.84rem]">{locating ? 'Detecting your location…' : 'Use current location'}</strong>
                      <small className="block mt-[0.18rem] text-p40-muted text-[0.69rem]">Use this device’s GPS for an accurate location</small>
                    </div>
                    {!locating ? <ChevronDown className="text-slate-500 -rotate-90" size={17} /> : <span className="w-[17px] h-[17px] flex-none border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />}
                  </button>
                  {error ? <p className="m-0 mt-4 p-[0.65rem_0.75rem] rounded-lg bg-rose-50 text-rose-800 text-[0.73rem] font-medium border border-rose-100 col-span-full">{error}</p> : null}

                  {/* The new saved addresses section */}
                  {user && addresses && addresses.length > 0 && (
                    <div className="mt-4 border border-p40-border rounded-lg p-4">
                      <div className="text-[0.7rem] font-semibold text-slate-500 mb-4 tracking-[0.05em] pl-[2.2rem]">SAVED ADDRESSES</div>
                      {addresses.map((address) => (
                        <div className="border-b border-dashed border-p40-border last:border-b-0" key={address.id}>
                          <button
                            className="flex items-start w-full py-3 bg-transparent border-none cursor-pointer text-left group"
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
                            <div className="shrink-0 w-[2.2rem] text-slate-700 flex justify-start pt-[0.1rem]">
                              {address.label === AddressLabel.HOME ? <UserRound size={20} /> : address.label === AddressLabel.WORK ? <ShoppingBag size={20} /> : <MapPin size={20} />}
                            </div>
                            <div>
                              <strong className="block text-[0.95rem] text-black mb-[0.2rem] transition-colors duration-200 group-hover:text-[#fc8019]">{address.label.charAt(0).toUpperCase() + address.label.slice(1).toLowerCase()}</strong>
                              <p className="m-0 text-[0.8rem] text-slate-500 leading-snug">{address.addressLine1}, {address.city}, {address.state}, India</p>
                            </div>
                          </button>
                        </div>
                      ))}
                      <Link href={ROUTES.customer.addresses} className="block pl-[2.2rem] mt-2 text-[0.75rem] font-semibold text-indigo-600 no-underline hover:underline" onClick={() => setOpen(false)}>
                        VIEW MORE
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center gap-[0.65rem] my-4 text-slate-400 text-[0.67rem] uppercase tracking-[0.06em] before:content-[''] before:h-px before:flex-1 before:bg-p40-border after:content-[''] after:h-px after:flex-1 after:bg-p40-border">
                    <span>or enter manually</span>
                  </div>
                  <form onSubmit={submitManualLocation} className="grid gap-[0.75rem]">
                    <label className="relative">
                      <span className="sr-only">Search for area, street name..</span>
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
                    <Button type="submit" disabled={!selectedAddress && !manualLocation.trim()} variant="primary" className="mt-3 w-full">
                      Confirm Location
                    </Button>
                  </form>
                  <p className="m-[0.85rem_0_0] text-p40-muted text-[0.66rem] leading-[1.45] text-center">
                    Your selection is stored only on this device so it is ready on your next visit.
                  </p>
                </section>
              ) : null}
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-10 ml-auto" aria-label="Primary">
          <Link href={ROUTES.customer.home} className="flex items-center gap-[0.6rem] text-[#06402b] font-semibold text-base transition-colors duration-200 hover:text-[#fc8019] group">
            <Home className="text-[#06402b] transition-colors duration-200 group-hover:text-[#fc8019]" size={18} />
            <span>Home</span>
          </Link>
          <Link href={ROUTES.customer.restaurants} className="flex items-center gap-[0.6rem] text-[#06402b] font-semibold text-base transition-colors duration-200 hover:text-[#fc8019] group">
            <UtensilsCrossed className="text-[#06402b] transition-colors duration-200 group-hover:text-[#fc8019]" size={18} />
            <span>Restaurants</span>
          </Link>
          <Link href={ROUTES.customer.restaurants} className="flex items-center gap-[0.6rem] text-[#06402b] font-semibold text-base transition-colors duration-200 hover:text-[#fc8019] group">
            <Search className="text-[#06402b] transition-colors duration-200 group-hover:text-[#fc8019]" size={18} />
            <span>Search</span>
          </Link>
          <Link href={ROUTES.customer.offers} className="relative flex items-center gap-[0.6rem] text-[#06402b] font-semibold text-base transition-colors duration-200 hover:text-[#fc8019] group">
            <Percent className="text-[#06402b] transition-colors duration-200 group-hover:text-[#fc8019]" size={18} />
            <span>Offers <span className="absolute -top-2 -right-[25px] text-[#ffa700] text-[0.65rem] font-extrabold tracking-[0.5px]">NEW</span></span>
          </Link>
          <Link href={ROUTES.customer.help} className="flex items-center gap-[0.6rem] text-[#06402b] font-semibold text-base transition-colors duration-200 hover:text-[#fc8019] group">
            <CircleHelp className="text-[#06402b] transition-colors duration-200 group-hover:text-[#fc8019]" size={18} />
            <span>Help</span>
          </Link>
          {/* User icon with dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              className="flex items-center gap-[0.6rem] text-[#06402b] font-semibold text-base transition-colors duration-200 hover:text-[#fc8019] group relative"
              aria-label="User menu"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <UserRound className="text-[#06402b] transition-colors duration-200 group-hover:text-[#fc8019]" size={20} />
              {user && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
            </button>

            {userMenuOpen && (
              <div className="absolute top-[calc(100%+0.5rem)] right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3">
                      <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                        <UserRound size={24} />
                      </div>
                      <div className="flex flex-col">
                        <strong className="text-sm">{user.name}</strong>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>
                    <div className="h-px bg-slate-100 my-2" />
                    <Link href={ROUTES.customer.profile} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <UserRound size={16} /> My Profile
                    </Link>
                    <Link href={ROUTES.customer.orders} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <ShoppingBag size={16} /> My Orders
                    </Link>
                    <Link href={ROUTES.customer.addresses} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <MapPin size={16} /> Addresses
                    </Link>
                    <div className="h-px bg-slate-100 my-2" />
                    <button type="button" className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" onClick={() => { setUserMenuOpen(false); signOut(); }}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={ROUTES.customer.login} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <UserRound size={16} /> Sign In
                    </Link>
                    <Link href={ROUTES.customer.register} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <UserRound size={16} /> Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart icon only with badge */}
          <Link className="flex items-center gap-[0.6rem] text-[#06402b] font-semibold text-base transition-colors duration-200 hover:text-[#fc8019] group" href={ROUTES.customer.cart} aria-label="Cart">
            <div className="relative flex items-center justify-center">
              <ShoppingBag className="text-[#06402b] transition-colors duration-200 group-hover:text-[#fc8019]" size={20} strokeWidth={2.5} />
              {cartItemCount > 0 && (
                <span className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[0.75rem] font-bold text-[#3d4152] transition-colors duration-200 group-hover:text-[#fc8019]">{cartItemCount}</span>
              )}
            </div>
          </Link>
        </nav>

        {/* Mobile Actions */}
        <div className="flex items-center gap-4 lg:hidden ml-auto shrink-0">
          <Link className="relative flex items-center justify-center text-[#06402b]" href={ROUTES.customer.cart} aria-label="Cart">
            <ShoppingBag size={24} strokeWidth={2} />
            {cartItemCount > 0 && (
              <span className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[0.7rem] font-bold text-[#3d4152]">{cartItemCount}</span>
            )}
          </Link>
          <button className="text-[#06402b] p-1" aria-label="Open menu" type="button" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </div>
    </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-lg text-slate-800">Menu</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-6">
              {user && (
                <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <UserRound size={24} />
                  </div>
                  <div>
                    <strong className="block text-slate-800">{user.name}</strong>
                    <span className="text-sm text-slate-500">{user.email}</span>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4">
                <Link href={ROUTES.customer.home} className="flex items-center gap-3 text-slate-700 font-medium p-2 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  <Home size={20} className="text-slate-400" /> Home
                </Link>
                <Link href={ROUTES.customer.restaurants} className="flex items-center gap-3 text-slate-700 font-medium p-2 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  <UtensilsCrossed size={20} className="text-slate-400" /> Restaurants
                </Link>
                <Link href={ROUTES.customer.offers} className="flex items-center gap-3 text-slate-700 font-medium p-2 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  <Percent size={20} className="text-slate-400" /> Offers
                  <span className="ml-auto bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-bold">NEW</span>
                </Link>
                <Link href={ROUTES.customer.help} className="flex items-center gap-3 text-slate-700 font-medium p-2 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  <CircleHelp size={20} className="text-slate-400" /> Help
                </Link>
              </nav>

              <div className="h-px bg-slate-100" />

              <nav className="flex flex-col gap-4">
                {user ? (
                  <>
                    <Link href={ROUTES.customer.profile} className="flex items-center gap-3 text-slate-700 font-medium p-2 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                      <UserRound size={20} className="text-slate-400" /> My Profile
                    </Link>
                    <Link href={ROUTES.customer.orders} className="flex items-center gap-3 text-slate-700 font-medium p-2 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                      <ShoppingBag size={20} className="text-slate-400" /> My Orders
                    </Link>
                    <Link href={ROUTES.customer.addresses} className="flex items-center gap-3 text-slate-700 font-medium p-2 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                      <MapPin size={20} className="text-slate-400" /> Addresses
                    </Link>
                    <button type="button" className="flex items-center gap-3 text-rose-600 font-medium p-2 hover:bg-rose-50 rounded-lg w-full text-left mt-4" onClick={() => { setMobileMenuOpen(false); signOut(); }}>
                      <LogOut size={20} className="text-rose-400" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={ROUTES.customer.login} className="flex items-center justify-center w-full bg-[#f58220] text-white py-3 rounded-xl font-bold" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link href={ROUTES.customer.register} className="flex items-center justify-center w-full bg-white border-2 border-[#f58220] text-[#f58220] py-3 rounded-xl font-bold" onClick={() => setMobileMenuOpen(false)}>
                      Create Account
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
