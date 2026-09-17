import { redirect } from 'next/navigation';
import { ROUTES } from '@plate40/config';
export default function SearchPage() { redirect(ROUTES.customer.restaurants); }
