'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { useSearchRestaurantsQuery } from '@plate40/state';
import { useDebouncedValue } from '@plate40/hooks';
import { STORAGE_KEYS } from '@plate40/config';
import { Button, EmptyState, ErrorState, Price, Skeleton } from '@plate40/ui';
import { RestaurantCard } from '../../components/restaurant-card';

export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState('');
  const [openNow, setOpenNow] = useState(false);
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(1);
  const [recent, setRecent] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; label?: string } | null>(null);
  const query = useDebouncedValue(search.trim());
  useEffect(() => {
    function readLocation() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.deliveryLocation) ?? 'null');
        setLocation(stored && typeof stored.latitude === 'number' && typeof stored.longitude === 'number' ? stored : null);
      } catch { setLocation(null); }
    }
    readLocation();
    try { const saved = JSON.parse(localStorage.getItem('plate40.recent-searches') ?? '[]'); if (Array.isArray(saved)) setRecent(saved.filter(s => typeof s === 'string').slice(0, 6)); } catch { /* Optional browser history. */ }
    window.addEventListener('storage', readLocation);
    window.addEventListener('plate40:location-changed', readLocation);
    window.addEventListener('focus', readLocation);
    return () => { window.removeEventListener('storage', readLocation); window.removeEventListener('plate40:location-changed', readLocation); window.removeEventListener('focus', readLocation); };
  }, []);
  useEffect(() => { setPage(1); }, [query, foodType, openNow, rating, location]);
  const { currentData: data, isFetching, isError, refetch } = useSearchRestaurantsQuery({ q: query || undefined, foodType: foodType || undefined, openNow, minimumRating: rating ? Number(rating) : undefined, page, limit: 12, latitude: location?.latitude, longitude: location?.longitude }, { pollingInterval: 60000, refetchOnFocus: true });
  function remember() {
    if (!search.trim()) return;
    const next = [search.trim(), ...recent.filter(s => s !== search.trim())].slice(0, 6);
    setRecent(next); try { localStorage.setItem('plate40.recent-searches', JSON.stringify(next)); } catch { /* Storage may be disabled. */ }
  }
  return <main className="p40-container py-8 pb-16 min-h-[75vh]">
    <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 mb-7">
      <span className="p40-eyebrow">FIND YOUR NEXT FAVOURITE</span>
      <h1 className="text-3xl sm:text-4xl text-[var(--p40-heading)] mt-3 mb-3">Good food, closer to you.</h1>
      <p className="text-slate-500 mb-6">Search a dish, a kitchen, or a neighbourhood.</p>
      <form className="flex gap-3" role="search" onSubmit={e => { e.preventDefault(); remember(); }}>
        <label className="flex-1 relative"><span className="sr-only">Search restaurants and dishes</span><Search size={20} className="absolute left-4 top-4 text-slate-400" /><input type="search" maxLength={100} className="p40-input pl-12 rounded-xl" placeholder="Try biryani, paneer, or a restaurant name" value={search} onChange={e => setSearch(e.target.value)} /></label>
        <Button type="submit">Search</Button>
      </form>
      <p className="p40-muted flex items-center gap-2 mt-4"><MapPin size={16} />{location ? `Delivering near ${location.label ?? 'your selected location'}` : 'Choose your delivery location in the header to see serviceable restaurants.'}</p>
      {!search && recent.length > 0 && <div className="flex flex-wrap gap-2 mt-4" aria-label="Recent searches">{recent.map(term => <button className="p40-button p40-button--secondary" key={term} onClick={() => setSearch(term)}>{term}</button>)}<button className="p40-button p40-button--secondary" onClick={() => { setRecent([]); try { localStorage.removeItem('plate40.recent-searches'); } catch { /* Optional. */ } }}>Clear history</button></div>}
    </section>
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <SlidersHorizontal size={18} aria-hidden />
      <label className="sr-only" htmlFor="search-food">Food preference</label><select id="search-food" className="p40-input max-w-48" value={foodType} onChange={e => setFoodType(e.target.value)}><option value="">All food types</option><option value="VEG">Vegetarian</option><option value="NON_VEG">Non vegetarian</option><option value="EGG">Egg</option></select>
      <label className="sr-only" htmlFor="search-rating">Minimum rating</label><select id="search-rating" className="p40-input max-w-44" value={rating} onChange={e => setRating(e.target.value)}><option value="">Any rating</option><option value="4">4+ stars</option><option value="3">3+ stars</option></select>
      <label className="p40-button p40-button--secondary"><input type="checkbox" checked={openNow} onChange={e => setOpenNow(e.target.checked)} />Open now</label>
    </div>
    <p className="p40-muted" role="status" aria-live="polite">{isFetching ? 'Finding your next meal…' : data ? `${data.meta.total}${data.meta.truncated ? '+' : ''} restaurants${query ? ` matching “${query}”` : ''}` : ''}</p>
    {data?.meta.truncated && <p className="p40-muted">Showing the top matches. Add a dish name or location to narrow your search.</p>}
    {isError ? <div><ErrorState message="We could not load search results." /><Button onClick={() => refetch()}>Try again</Button></div> : !data && isFetching ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1, 2, 3, 4, 5, 6].map(n => <Skeleton key={n} />)}</div> : data?.items.length ? <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy={isFetching}>
        {data.items.map(restaurant => <article key={restaurant.id} className="flex flex-col gap-2">
          <RestaurantCard restaurant={restaurant} />
          {!!restaurant.matchingDishes?.length && <div className="p40-card p-4"><p className="p40-eyebrow mt-0 mb-3">MATCHING DISHES</p>{restaurant.matchingDishes.map(dish => <Link key={dish.id} href={`/restaurants/${restaurant.id}#dish-${dish.id}`} className="flex items-start justify-between gap-3 py-3 border-t border-slate-100" onClick={remember}><div><strong className="text-sm">{dish.name}</strong><small className="block text-slate-500 mt-1">{dish.isOrderable ? `${dish.preparationTimeMinutes} min preparation` : dish.availabilityReason}</small></div><Price value={dish.discountedPrice ?? dish.price} /></Link>)}</div>}
        </article>)}
      </div>
      <nav aria-label="Search pages" className="flex items-center justify-center gap-4 mt-8"><Button variant="secondary" disabled={page <= 1 || isFetching} onClick={() => setPage(p => p - 1)}>Previous</Button><span>Page {page} of {data.meta.totalPages}</span><Button variant="secondary" disabled={page >= data.meta.totalPages || isFetching} onClick={() => setPage(p => p + 1)}>Next</Button></nav>
    </> : <EmptyState title="No matching kitchens" description="Try a different dish or restaurant, change your location, or clear your filters." action={<Button variant="secondary" onClick={() => { setSearch(''); setFoodType(''); setRating(''); setOpenNow(false); }}>Clear filters</Button>} />}
  </main>;
}
