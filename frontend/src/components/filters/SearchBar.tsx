'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { X } from 'lucide-react';

export const SearchBar = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const initial = params?.get('q') ?? '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(initial);
  }, [params]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const searchParams = new URLSearchParams();
    
    if (query.trim()) {
      searchParams.set('q', query.trim());
    }
    
    // Preserve other filters
    const platforms = params?.get('platforms');
    const genres = params?.get('genres');
    const regions = params?.get('regions');
    const minPrice = params?.get('minPrice');
    const maxPrice = params?.get('maxPrice');
    const safeOnly = params?.get('safeOnly');
    const sort = params?.get('sort');
    
    if (platforms) searchParams.set('platforms', platforms);
    if (genres) searchParams.set('genres', genres);
    if (regions) searchParams.set('regions', regions);
    if (minPrice) searchParams.set('minPrice', minPrice);
    if (maxPrice) searchParams.set('maxPrice', maxPrice);
    if (safeOnly) searchParams.set('safeOnly', safeOnly);
    if (sort) searchParams.set('sort', sort);
    
    const url = searchParams.toString() ? `/games?${searchParams.toString()}` : '/games';
    router.push(url);
  };

  const clearSearch = () => {
    setQuery('');
    const searchParams = new URLSearchParams();
    
    // Preserve filters but remove search
    const platforms = params?.get('platforms');
    const genres = params?.get('genres');
    const regions = params?.get('regions');
    const minPrice = params?.get('minPrice');
    const maxPrice = params?.get('maxPrice');
    const safeOnly = params?.get('safeOnly');
    const sort = params?.get('sort');
    
    if (platforms) searchParams.set('platforms', platforms);
    if (genres) searchParams.set('genres', genres);
    if (regions) searchParams.set('regions', regions);
    if (minPrice) searchParams.set('minPrice', minPrice);
    if (maxPrice) searchParams.set('maxPrice', maxPrice);
    if (safeOnly) searchParams.set('safeOnly', safeOnly);
    if (sort) searchParams.set('sort', sort);
    
    const url = searchParams.toString() ? `/games?${searchParams.toString()}` : '/games';
    router.push(url);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-[30px] border border-white/20 bg-white/10 p-4 text-sm text-white backdrop-blur shadow-lg"
    >
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
        <Icon name="search" size={14} />
        جستجو در GameClub
      </label>
      <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
        <Icon name="search" size={18} className="text-white/70" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="نام بازی، ژانر، پلتفرم یا منطقه..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="rounded-lg p-1 hover:bg-white/20 transition"
          >
            <X size={16} className="text-white/70" />
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-700 hover:scale-105"
        >
          <Icon name="search" size={14} />
          جستجو
        </button>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-emerald-100">
        {['God of War', 'Spider-Man', 'Safe Account', 'EA FC 25'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              setTimeout(() => {
                const form = document.querySelector('form');
                form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }, 0);
            }}
            className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10 transition"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
};

