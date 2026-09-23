'use client';

import { useState, useRef, useEffect } from 'react';
import { FoodType } from '@plate40/types';
import { useRestaurantsQuery } from '@plate40/state';
import { useDebouncedValue } from '@plate40/hooks';
import { EmptyState, ErrorState, PageHeader, SearchInput, Skeleton } from '@plate40/ui';
import { RestaurantCard } from '../../components/restaurant-card';
import { ChevronDown } from 'lucide-react';

const OPTIONS = [
  { label: 'All food types', value: '' },
  { label: 'Vegetarian', value: FoodType.VEG },
  { label: 'Non vegetarian', value: FoodType.NON_VEG },
  { label: 'Egg', value: FoodType.EGG },
];

function FoodTypeDropdown({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = OPTIONS.find(opt => opt.value === value) || OPTIONS[0]!;

  return (
    <div ref={dropdownRef} className="relative min-w-0 sm:min-w-[220px] w-full sm:w-auto">
      <button
        type="button"
        className="p40-input flex justify-between items-center cursor-pointer text-left min-h-[48px] px-4 w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-50 list-none p-1.5 m-0">
          {OPTIONS.map(option => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`py-3 px-4 cursor-pointer rounded-md transition-[background,color] duration-200 ${
                value === option.value
                  ? 'text-p40-brand font-semibold bg-orange-50'
                  : 'text-slate-700 font-normal bg-transparent hover:bg-orange-50'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RestaurantsPage() {
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState<FoodType | ''>('');
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading, isError } = useRestaurantsQuery({ page: 1, limit: 24, search: debouncedSearch || undefined, foodType: foodType || undefined });

  return (
    <main className="p40-container py-8 pb-16 min-h-[70vh]">
      <PageHeader title="Restaurants near you" description="Verified hyperlocal kitchens serving everyday meals." />
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search restaurants" />
        </div>
        <FoodTypeDropdown value={foodType} onChange={(v) => setFoodType(v as FoodType | '')} />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} />)}
        </div>
      ) : isError ? (
        <ErrorState />
      ) : data?.items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.items.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
        </div>
      ) : (
        <EmptyState title="No restaurants found" description="Try a different search or clear the food preference filter." />
      )}
    </main>
  );
}
