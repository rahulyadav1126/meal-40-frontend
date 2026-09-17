'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { useCartItemsQuery, useCartsQuery, useRemoveCartItemMutation, useUpdateCartItemMutation } from '@plate40/state';
import { Card, EmptyState, ErrorState, PageHeader, Price, Skeleton } from '@plate40/ui';

export default function CartPage() {
  const carts = useCartsQuery();
  const cart = carts.data?.[0];
  const items = useCartItemsQuery(cart?.id ?? 0, { skip: !cart });
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  if (carts.isLoading || items.isLoading) return <main className="page-shell p40-container"><Skeleton /></main>;
  if (carts.isError || items.isError) return <main className="page-shell p40-container"><ErrorState message="Sign in to load your cart." /></main>;
  if (!cart || !items.data?.length) return <main className="page-shell p40-container"><PageHeader title="Your cart" /><EmptyState title="Your plate is empty" description="Browse a nearby kitchen and add a fresh meal to get started." action={<Link className="p40-button p40-button--primary" href={ROUTES.customer.restaurants}>Browse restaurants</Link>} /></main>;
  const subtotal = items.data.reduce((total, item) => total + Number(item.menuItem.discountedPrice || item.menuItem.price) * item.quantity, 0);
  return <main className="page-shell p40-container"><PageHeader title="Your plate" description={`From ${cart.restaurant?.name ?? 'your selected restaurant'}`} /><div className="cart-layout"><section className="cart-list">{items.data.map((item) => <Card className="cart-row" key={item.id}><div className="cart-row__photo" style={item.menuItem.imageUrl ? { backgroundImage: `url(${item.menuItem.imageUrl})` } : undefined} /><div><h3>{item.menuItem.name}</h3><p>{item.menuItem.description}</p><Price value={item.menuItem.discountedPrice || item.menuItem.price} /></div><div className="quantity-control"><button aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => updateItem({ itemId: item.id, quantity: item.quantity - 1 })}><Minus size={15} /></button><strong>{item.quantity}</strong><button aria-label="Increase quantity" onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}><Plus size={15} /></button></div><button className="icon-danger" aria-label="Remove item" onClick={() => removeItem(item.id)}><Trash2 size={18} /></button></Card>)}</section><Card className="cart-summary"><span className="section-kicker">Estimated bill</span><h2>Order summary</h2><div><span>Item subtotal</span><Price value={subtotal} /></div><div><span>Delivery, platform fee, discount and taxes</span><strong>Calculated securely by Plate40</strong></div><div className="cart-summary__total"><span>Estimated subtotal</span><Price value={subtotal} /></div><Link className="p40-button p40-button--primary" href={ROUTES.customer.checkout}>Proceed to checkout</Link><small>Final pricing and availability are always confirmed by the backend.</small></Card></div></main>;
}
