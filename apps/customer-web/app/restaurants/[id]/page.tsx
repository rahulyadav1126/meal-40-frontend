'use client';

import { useParams } from 'next/navigation';
import { Clock3, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAddCartItemMutation, useMenuQuery, useRestaurantQuery } from '@plate40/state';
import { FoodType } from '@plate40/types';
import { Badge, Button, Card, EmptyState, ErrorState, FoodTypeIndicator, Price, Skeleton } from '@plate40/ui';

export default function RestaurantMenuPage() {
  const id = useParams<{ id: string }>().id;
  const { data: restaurant, isLoading: restaurantLoading, isError } = useRestaurantQuery(id);
  const { data: menu = [], isLoading: menuLoading } = useMenuQuery(id);
  const [addItem, addState] = useAddCartItemMutation();
  async function add(menuItemId: number) { try { await addItem({ menuItemId, quantity: 1 }).unwrap(); toast.success('Added to cart'); } catch { toast.error('Sign in to add this item to your cart.'); } }
  if (restaurantLoading) return <main className="page-shell p40-container"><Skeleton /></main>;
  if (isError || !restaurant) return <main className="page-shell p40-container"><ErrorState message="This restaurant is unavailable." /></main>;
  return <main className="menu-page"><section className="restaurant-hero"><div className="restaurant-hero__image" style={restaurant.coverImageUrl ? { backgroundImage: `linear-gradient(0deg,rgb(15 23 42 / 80%),transparent),url(${restaurant.coverImageUrl})` } : undefined}><div className="p40-container restaurant-hero__content"><Badge tone="success">Pure neighborhood kitchen</Badge><h1>{restaurant.name}</h1><p>{restaurant.description}</p><div><span><Star size={16} /> {Number(restaurant.averageRating || 0).toFixed(1)}</span><span><MapPin size={16} /> {restaurant.city}, {restaurant.state}</span><span><Clock3 size={16} /> 20-25 mins</span></div></div></div></section><div className="p40-container menu-layout"><aside className="p40-card menu-categories"><strong>Menu categories</strong><a href="#all">All items <span>{menu.length}</span></a><a href="#specials">Pocket specials ₹40</a><a href="#thalis">Deluxe thalis</a><a href="#beverages">Breads & beverages</a></aside><section id="all" className="menu-list"><header><div><span className="section-kicker">Fresh today</span><h2>Menu</h2></div><Badge tone="success">Veg available</Badge></header>{menuLoading ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} />) : menu.length ? menu.map((item) => <Card className="menu-item" key={item.id}><div><div className="menu-item__label"><FoodTypeIndicator vegetarian={item.foodType === FoodType.VEG} /> {item.isFeatured ? <Badge tone="danger">Bestseller</Badge> : null}</div><h3>{item.name}</h3><Price value={item.discountedPrice || item.price} /><p>{item.description}</p></div><div className="menu-item__action"><div className="menu-item__photo" style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined} /><Button variant="secondary" disabled={addState.isLoading || !item.isAvailable} onClick={() => add(item.id)}>+ Add</Button></div></Card>) : <EmptyState title="No menu items" description="This kitchen has not published available dishes yet." />}</section><aside className="p40-card plate-preview"><span className="section-kicker">Your plate</span><h2>Ready to build your meal?</h2><p>Add items from the menu. Your live cart, backend pricing, coupons, taxes, and fees appear on the cart page.</p><a className="p40-button p40-button--primary" href="/cart">View cart</a></aside></div></main>;
}
