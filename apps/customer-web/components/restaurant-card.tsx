import Link from 'next/link';
import { Clock3, MapPin, Star } from 'lucide-react';
import { Card } from '@plate40/ui';
import { RestaurantOpeningStatus, type Restaurant } from '@plate40/types';

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const open = restaurant.isAcceptingOrders ?? restaurant.openingStatus === RestaurantOpeningStatus.OPEN;
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="group block h-full">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border-slate-100/80 bg-white">
        <div
          className="min-h-[170px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50 via-rose-50 to-amber-50 grid place-items-center relative overflow-hidden"
          style={restaurant.coverImageUrl ? { backgroundImage: `linear-gradient(to bottom, transparent 40%, rgba(15,23,42,0.8)), url(${restaurant.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {restaurant.coverImageUrl ? null : (
            <div className="absolute inset-0 flex items-center justify-center opacity-60">
              <span className="text-[5rem] font-bold text-orange-200/50 font-serif leading-none mix-blend-multiply group-hover:scale-110 transition-transform duration-500">{restaurant.name.slice(0, 1)}</span>
            </div>
          )}
          
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider rounded-full backdrop-blur-md shadow-sm ${open ? 'bg-emerald-50/90 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-white/90 text-rose-600 ring-1 ring-rose-600/20'}`}>
              {open ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="m-0 text-lg font-bold text-slate-800 leading-tight group-hover:text-[#fc8019] transition-colors">{restaurant.name}</h3>
          <p className="text-slate-500 text-[0.85rem] mt-2 mb-4 flex-1 line-clamp-2 leading-relaxed">
            {restaurant.description || 'Wholesome neighborhood meals prepared fresh everyday.'}
          </p>
          
          <div className="flex justify-between items-center bg-slate-50/80 p-2.5 rounded-xl border border-slate-100/50 text-[0.75rem] font-medium text-slate-600">
            <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)]">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span className="text-slate-700 font-bold">{Number(restaurant.averageRating || 0).toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1.5 opacity-80">
              <Clock3 size={14} className="text-slate-400" /> 
              {restaurant.distanceKm != null ? `${restaurant.distanceKm.toFixed(1)} km` : open ? 'Open now' : 'Closed'}
            </span>
            <span className="flex items-center gap-1.5 opacity-80 truncate max-w-[90px]">
              <MapPin size={14} className="text-slate-400 shrink-0" /> 
              <span className="truncate">{restaurant.city}</span>
            </span>
          </div>
          {(restaurant.closesAt || restaurant.nextOpensAt) && <p className="p40-muted mb-0">{open ? 'Closes' : 'Opens'} {new Date((open ? restaurant.closesAt : restaurant.nextOpensAt)!).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</p>}
        </div>
      </Card>
    </Link>
  );
}
