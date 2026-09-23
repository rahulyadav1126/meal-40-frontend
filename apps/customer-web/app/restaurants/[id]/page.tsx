'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { Clock3, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@plate40/config';
import { useAddCartItemMutation, useUpdateCartItemMutation, useRemoveCartItemMutation, useCartsQuery, useCartItemsQuery, useMenuQuery, useRestaurantQuery } from '@plate40/state';
import { FoodType } from '@plate40/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  FoodTypeIndicator,
  Price,
  Skeleton,
} from '@plate40/ui';
import { AuthModal } from '../../../components/auth-modal';

export default function RestaurantMenuPage() {
  const id = useParams<{ id: string }>().id;
  const router = useRouter();
  const { data: restaurant, isLoading: restaurantLoading, isError } = useRestaurantQuery(id);
  const { data: menu = [], isLoading: menuLoading } = useMenuQuery(id);
  const { data: carts } = useCartsQuery();
  const cartId = carts?.[0]?.id;
  const { data: cartItems } = useCartItemsQuery(cartId as number, { skip: !cartId });
  const [addItem, addState] = useAddCartItemMutation();
  const [updateItem, updateState] = useUpdateCartItemMutation();
  const [removeItem, removeState] = useRemoveCartItemMutation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  async function add(menuItemId: number | string) {
    const normalizedMenuItemId = Number(menuItemId);
    if (!Number.isInteger(normalizedMenuItemId) || normalizedMenuItemId < 1) {
      toast.error('This menu item is unavailable. Please refresh the page and try again.');
      return;
    }
    try {
      await addItem({ menuItemId: normalizedMenuItemId, quantity: 1 }).unwrap();
      toast.success('Added to cart');
    } catch (error) {
      const status =
        typeof error === 'object' && error && 'status' in error
          ? Number((error as { status: number }).status)
          : 0;
      const message =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      if (status === 401) {
        setIsAuthModalOpen(true);
        toast.error('Sign in to add this item to your cart.');
      } else if (status === 403) {
        toast.error('Please use a customer account to place an order.');
      } else {
        toast.error(message ?? 'Could not add this item. Please try again.');
      }
    }
  }

  async function updateQuantity(cartItemId: number, quantity: number) {
    if (quantity < 1) {
      return remove(cartItemId);
    }
    try {
      await updateItem({ itemId: cartItemId, quantity }).unwrap();
    } catch {
      toast.error('Could not update quantity. Please try again.');
    }
  }

  async function remove(cartItemId: number) {
    try {
      await removeItem(cartItemId).unwrap();
    } catch {
      toast.error('Could not remove item. Please try again.');
    }
  }
  if (restaurantLoading)
    return (
      <main className="p40-container py-8 pb-16 min-h-[70vh]">
        <Skeleton />
      </main>
    );
  if (isError || !restaurant)
    return (
      <main className="p40-container py-8 pb-16 min-h-[70vh]">
        <ErrorState message="This restaurant is unavailable." />
      </main>
    );
  return (
    <main>
      <section className="py-[1.3rem]">
        <div
          className="w-[min(var(--p40-max-width),calc(100%-2rem))] mx-auto min-h-[300px] rounded-[18px] bg-[linear-gradient(135deg,#7f1d1d,#f97316)] bg-cover bg-center flex items-end overflow-hidden"
          style={
            restaurant.coverImageUrl
              ? {
                  backgroundImage: `linear-gradient(0deg,rgb(15 23 42 / 80%),transparent),url(${restaurant.coverImageUrl})`,
                }
              : undefined
          }
        >
          <div className="p40-container text-white p-8">
            <Badge tone="success">Pure neighborhood kitchen</Badge>
            <h1 className="text-[clamp(2rem,5vw,3rem)] my-2">{restaurant.name}</h1>
            <p className="max-w-[700px]">{restaurant.description}</p>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="inline-flex gap-1.5 items-center text-[0.84rem]">
                <Star size={16} /> {Number(restaurant.averageRating || 0).toFixed(1)}
              </span>
              <span className="inline-flex gap-1.5 items-center text-[0.84rem]">
                <MapPin size={16} /> {restaurant.city}, {restaurant.state}
              </span>
              <span className="inline-flex gap-1.5 items-center text-[0.84rem]">
                <Clock3 size={16} /> 20-25 mins
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="p40-container grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_300px] gap-5 items-start py-4 pb-16">
        <aside className="p40-card sticky top-[90px] p-4 grid gap-3.5 hidden lg:grid">
          <strong>Menu categories</strong>
          <a href="#all" className="py-2.5 px-3 rounded-lg flex justify-between text-[0.86rem] text-p40-primary bg-indigo-50 border-l-[3px] border-p40-primary">
            All items <span>{menu.length}</span>
          </a>
          <a href="#specials" className="py-2.5 px-3 rounded-lg flex justify-between text-[0.86rem] text-slate-700 hover:bg-slate-50">Pocket specials ₹40</a>
          <a href="#thalis" className="py-2.5 px-3 rounded-lg flex justify-between text-[0.86rem] text-slate-700 hover:bg-slate-50">Deluxe thalis</a>
          <a href="#beverages" className="py-2.5 px-3 rounded-lg flex justify-between text-[0.86rem] text-slate-700 hover:bg-slate-50">Breads & beverages</a>
        </aside>
        <section id="all" className="grid gap-3">
          <header className="flex items-end justify-between">
            <div>
              <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Fresh today</span>
              <h2 className="my-1">Menu</h2>
            </div>
            <Badge tone="success">Veg available</Badge>
          </header>
          {menuLoading ? (
            Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} />)
          ) : menu.length ? (
            menu.map((item) => (
              <Card className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-4" key={item.id}>
                <div>
                  <div className="flex gap-2 items-center">
                    <FoodTypeIndicator vegetarian={item.foodType === FoodType.VEG} />{' '}
                    {item.isFeatured ? <Badge tone="danger">Bestseller</Badge> : null}
                  </div>
                  <h3 className="mt-2 mb-1">{item.name}</h3>
                  <Price value={item.discountedPrice || item.price} />
                  <p className="text-p40-muted text-[0.84rem] mt-2 mb-0">{item.description}</p>
                </div>
                <div className="grid gap-2 h-max sm:h-auto">
                  <div
                    className="min-h-[90px] rounded-[10px] bg-[linear-gradient(135deg,#ffedd5,#ffe4e6)] bg-cover bg-center"
                    style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
                  />
                  {(() => {
                    const cartItem = cartItems?.find((ci) => ci.menuItemId === item.id);
                    if (cartItem) {
                      return (
                        <div className="flex items-center justify-between bg-slate-100 rounded-md border border-slate-200 h-[40px] px-1">
                          <button
                            disabled={updateState.isLoading || removeState.isLoading}
                            onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                            className="w-8 h-full flex items-center justify-center font-bold text-p40-primary text-xl disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm text-slate-800">{cartItem.quantity}</span>
                          <button
                            disabled={updateState.isLoading}
                            onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center font-bold text-p40-primary text-xl disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      );
                    }
                    return (
                      <Button
                        variant="secondary"
                        disabled={addState.isLoading || !item.isAvailable}
                        onClick={() => add(item.id)}
                      >
                        + Add
                      </Button>
                    );
                  })()}
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No menu items"
              description="This kitchen has not published available dishes yet."
            />
          )}
        </section>
        <aside className="p40-card sticky top-[90px] p-4 grid gap-3.5">
          <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Your plate</span>
          <h2 className="m-0">Ready to build your meal?</h2>
          <p className="m-0 text-p40-muted leading-[1.6]">
            Add items from the menu. Your live cart, backend pricing, coupons, taxes, and fees
            appear on the cart page.
          </p>
          <a className="p40-button p40-button--primary w-full text-center mt-2" href="/cart">
            View cart
          </a>
        </aside>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          // Optional: automatically add the item if you stored its ID, but for now just close the modal.
        }}
      />
    </main>
  );
}
