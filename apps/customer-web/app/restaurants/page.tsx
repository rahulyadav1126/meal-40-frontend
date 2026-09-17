'use client';

import { useState } from 'react';
import { FoodType } from '@plate40/types';
import { useRestaurantsQuery } from '@plate40/state';
import { useDebouncedValue } from '@plate40/hooks';
import { EmptyState, ErrorState, PageHeader, SearchInput, Skeleton } from '@plate40/ui';
import { RestaurantCard } from '../../components/restaurant-card';

export default function RestaurantsPage() {
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState<FoodType | ''>('');
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading, isError } = useRestaurantsQuery({ page: 1, limit: 24, search: debouncedSearch || undefined, foodType: foodType || undefined });
  return <main className="page-shell p40-container"><PageHeader title="Restaurants near you" description="Verified hyperlocal kitchens serving everyday meals." /><div className="filter-bar"><SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search restaurants" /><select className="p40-input" value={foodType} onChange={(event) => setFoodType(event.target.value as FoodType | '')}><option value="">All food types</option><option value={FoodType.VEG}>Vegetarian</option><option value={FoodType.NON_VEG}>Non vegetarian</option><option value={FoodType.EGG}>Egg</option></select></div>{isLoading ? <div className="restaurant-grid">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} />)}</div> : isError ? <ErrorState /> : data?.items.length ? <div className="restaurant-grid">{data.items.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div> : <EmptyState title="No restaurants found" description="Try a different search or clear the food preference filter." />}</main>;
}
