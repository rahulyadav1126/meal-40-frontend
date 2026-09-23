'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { useCartItemsQuery, useCartsQuery, useRemoveCartItemMutation, useUpdateCartItemMutation } from '@plate40/state';
import { STORAGE_KEYS } from '@plate40/config';
import { SESSION_CHANGED_EVENT } from '@plate40/auth';
import { UserRole, type User } from '@plate40/types';
import { Button, Card, EmptyState, ErrorState, PageHeader, Price, Skeleton } from '@plate40/ui';
import { AuthModal } from '../../components/auth-modal';

function subscribeToSession(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(SESSION_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(SESSION_CHANGED_EVENT, callback);
  };
}

function sessionSnapshot() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEYS.user);
}

export default function CartPage() {
  const carts = useCartsQuery();
  const cart = carts.data?.[0];
  const items = useCartItemsQuery(cart?.id ?? 0, { skip: !cart });
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  if (!user) {
    return (
      <main className="page-shell p40-container min-h-[70vh] flex flex-col justify-center">
        <EmptyState
          title="Sign in to view your plate"
          description="You need to be logged in to view items and checkout."
          action={
            <Button variant="primary" onClick={() => setIsAuthModalOpen(true)}>
              Sign in
            </Button>
          }
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
      </main>
    );
  }

  if (carts.isLoading || items.isLoading) return <main className="page-shell p40-container"><Skeleton /></main>;
  if (carts.isError || items.isError) return <main className="page-shell p40-container"><ErrorState message="Could not load your cart." /></main>;
  const validItems = items.data?.filter((item) => item.menuItem != null) ?? [];
  if (!cart || !validItems.length) return <main className="page-shell p40-container"><PageHeader title="Your cart" /><EmptyState title="Your plate is empty" description="Browse a nearby kitchen and add a fresh meal to get started." action={<Link className="p40-button p40-button--primary" href={ROUTES.customer.restaurants}>Browse restaurants</Link>} /></main>;
  const subtotal = validItems.reduce((total, item) => total + Number(item.menuItem.discountedPrice || item.menuItem.price) * item.quantity, 0);
  return (
    <main className="p40-container py-8 pb-16 min-h-[70vh]">
      <PageHeader title="Your plate" description={`From ${cart.restaurant?.name ?? 'your selected restaurant'}`} />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <section className="grid gap-3.5">
          {validItems.map((item) => (
            <Card className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center" key={item.id}>
              <div className="flex gap-4 flex-1">
                <div
                  className="w-[70px] sm:w-[90px] shrink-0 aspect-square rounded-xl bg-[linear-gradient(135deg,#ffedd5,#ffe4e6)] bg-cover bg-center"
                  style={item.menuItem.imageUrl ? { backgroundImage: `url(${item.menuItem.imageUrl})` } : undefined}
                />
                <div className="flex-1">
                  <h3 className="my-1 text-base sm:text-lg">{item.menuItem.name}</h3>
                  <p className="my-1 text-p40-muted text-[0.82rem] line-clamp-2 sm:line-clamp-none">{item.menuItem.description}</p>
                  <Price value={item.menuItem.discountedPrice || item.menuItem.price} />
                </div>
              </div>
              
              <div className="flex justify-between items-center sm:gap-4 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-dashed border-slate-200">
                <div className="flex items-center border border-rose-200 rounded-lg text-p40-primary">
                  <button
                    className="w-[34px] h-[34px] grid place-items-center border-0 bg-transparent text-inherit cursor-pointer"
                    aria-label="Decrease quantity"
                    disabled={item.quantity <= 1}
                    onClick={() => updateItem({ itemId: item.id, quantity: item.quantity - 1 })}
                  >
                    <Minus size={15} />
                  </button>
                  <strong className="min-w-[1.5rem] text-center">{item.quantity}</strong>
                  <button
                    className="w-[34px] h-[34px] grid place-items-center border-0 bg-transparent text-inherit cursor-pointer"
                    aria-label="Increase quantity"
                    onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  className="text-p40-primary w-[34px] h-[34px] grid place-items-center border-0 bg-transparent cursor-pointer hover:bg-rose-50 rounded-full transition-colors"
                  aria-label="Remove item"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </section>
        <Card className="sticky top-[90px] p-5 grid gap-4">
          <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Estimated bill</span>
          <h2 className="my-1">Order summary</h2>
          <div className="flex justify-between gap-4 text-[0.85rem]">
            <span>Item subtotal</span>
            <Price value={subtotal} />
          </div>
          <div className="flex justify-between gap-4 text-[0.85rem]">
            <span>Delivery, platform fee, discount and taxes</span>
            <strong className="text-right max-w-[180px]">Calculated securely by Plate40</strong>
          </div>
          <div className="flex justify-between gap-4 text-[0.85rem] border-t border-dashed border-p40-border pt-4 font-[800] text-[1.2rem] font-heading">
            <span>Estimated subtotal</span>
            <Price value={subtotal} />
          </div>
          <Link className="p40-button p40-button--primary text-center" href={ROUTES.customer.checkout}>
            Proceed to checkout
          </Link>
          <small className="text-p40-muted leading-[1.5]">Final pricing and availability are always confirmed by the backend.</small>
        </Card>
      </div>
    </main>
  );
}
