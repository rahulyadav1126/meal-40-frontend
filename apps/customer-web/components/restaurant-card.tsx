import Link from 'next/link';
import { Clock3, MapPin, Star } from 'lucide-react';
import { Badge, Card } from '@plate40/ui';
import { RestaurantOpeningStatus, type Restaurant } from '@plate40/types';

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const open = restaurant.openingStatus === RestaurantOpeningStatus.OPEN;
  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <Card className="overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-p40-2">
        <div
          className="min-h-[155px] bg-[linear-gradient(135deg,#ffe4e6,#ffedd5)] grid place-items-center text-p40-primary font-[800] text-[1.5rem] font-heading"
          style={restaurant.coverImageUrl ? { backgroundImage: `linear-gradient(0deg,rgb(15 23 42 / 35%),transparent),url(${restaurant.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {restaurant.coverImageUrl ? null : restaurant.name.slice(0, 1)}
        </div>
        <div className="p-4">
          <div className="flex justify-between gap-2">
            <h3 className="m-0">{restaurant.name}</h3>
            <Badge tone={open ? 'success' : 'danger'}>{open ? 'Open' : 'Closed'}</Badge>
          </div>
          <p className="text-p40-muted min-h-[2.5rem] mt-2 mb-2">{restaurant.description || 'Wholesome neighborhood meals prepared fresh.'}</p>
          <div className="flex justify-between gap-2 text-[0.78rem]">
            <span className="inline-flex gap-1 items-center"><Star size={13} fill="#f59e0b" color="#f59e0b" /> {Number(restaurant.averageRating || 0).toFixed(1)}</span>
            <span className="inline-flex gap-1 items-center"><Clock3 size={13} /> 20-25 min</span>
            <span className="inline-flex gap-1 items-center"><MapPin size={13} /> {restaurant.city}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
