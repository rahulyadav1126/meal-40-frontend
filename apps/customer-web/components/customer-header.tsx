'use client';

import Link from 'next/link';
import { MapPin, Menu, Search, ShoppingBag, UserRound } from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { useAppSelector } from '@plate40/state';

export function CustomerHeader() {
  const location = useAppSelector((state) => state.client.selectedLocation);
  return <header className="customer-header"><div className="customer-header__inner p40-container"><Link className="brand" href={ROUTES.customer.home}><span className="brand__mark">P</span><span>Plate40</span></Link><button className="location-pill" type="button"><MapPin size={17} /><span>Delivery to: <strong>{location}</strong></span></button><label className="header-search"><Search size={17} aria-hidden /><input aria-label="Search meals and restaurants" placeholder="Search for dishes, thalis, combos..." /></label><nav className="desktop-nav" aria-label="Primary"><Link href={ROUTES.customer.home}>Home</Link><Link href={ROUTES.customer.restaurants}>Restaurants</Link><Link href={ROUTES.customer.offers}>Offers</Link><Link href={ROUTES.customer.orders}>Orders</Link></nav><Link className="account-link" href={ROUTES.customer.login}><UserRound size={18} /><span>Sign in</span></Link><Link className="cart-link" href={ROUTES.customer.cart}><ShoppingBag size={18} /><span>Cart</span></Link><button className="mobile-menu" aria-label="Open menu" type="button"><Menu /></button></div></header>;
}
