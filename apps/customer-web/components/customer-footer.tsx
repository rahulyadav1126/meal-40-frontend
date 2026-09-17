import Link from 'next/link';
import { ROUTES } from '@plate40/config';

export function CustomerFooter() {
  return <footer className="customer-footer"><div className="p40-container footer-grid"><div><div className="brand"><span className="brand__mark">P</span><span>Plate40</span></div><p>Nourishing everyday meals from verified neighborhood kitchens, delivered warm and on time.</p></div><div><strong>Explore</strong><Link href={ROUTES.customer.restaurants}>Restaurants</Link><Link href={ROUTES.customer.offers}>Offers</Link></div><div><strong>Account</strong><Link href={ROUTES.customer.orders}>Orders</Link><Link href={ROUTES.customer.profile}>Profile</Link></div><div><strong>Support</strong><a href="mailto:support@plate40.test">Help desk</a><span>All systems operational</span></div></div></footer>;
}
