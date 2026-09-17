import Link from 'next/link';
import { Clock3, MapPin, Star } from 'lucide-react';
import { Badge, Card } from '@plate40/ui';
import { RestaurantOpeningStatus, type Restaurant } from '@plate40/types';

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const open = restaurant.openingStatus === RestaurantOpeningStatus.OPEN;
  return <Link href={`/restaurants/${restaurant.id}`}><Card className="restaurant-card"><div className="restaurant-card__image" style={restaurant.coverImageUrl ? { backgroundImage: `linear-gradient(0deg,rgb(15 23 42 / 35%),transparent),url(${restaurant.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>{restaurant.coverImageUrl ? null : restaurant.name.slice(0, 1)}</div><div className="restaurant-card__body"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><h3>{restaurant.name}</h3><Badge tone={open ? 'success' : 'danger'}>{open ? 'Open' : 'Closed'}</Badge></div><p>{restaurant.description || 'Wholesome neighborhood meals prepared fresh.'}</p><div className="restaurant-card__meta"><span><Star size={13} fill="#f59e0b" color="#f59e0b" /> {Number(restaurant.averageRating || 0).toFixed(1)}</span><span><Clock3 size={13} /> 20-25 min</span><span><MapPin size={13} /> {restaurant.city}</span></div></div></Card></Link>;
}
