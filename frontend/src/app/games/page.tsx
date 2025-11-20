'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameCard } from '@/components/cards/GameCard';
import { GameCarousel } from '@/components/carousel/GameCarousel';
import { API_BASE_URL } from '@/lib/api';
import type { GameCardContent } from '@/data/home';
import { SearchBar } from '@/components/filters/SearchBar';
import { GameFilters } from '@/components/filters/GameFilters';
import { ActiveFilters } from '@/components/filters/ActiveFilters';
import { Icon } from '@/components/icons/Icon';

type BackendGame = {
  id: string;
  slug: string;
  title: string;
  description: string;
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;
  safeAccountAvailable: boolean;
  coverUrl?: string;
};

const mapGame = (game: BackendGame): GameCardContent => ({
  id: game.id,
  slug: game.slug,
  title: game.title,
  platform: game.platform,
  price: game.basePrice,
  region: game.regionOptions[0] ?? 'R2',
  safe: game.safeAccountAvailable,
  monthlyPrice: Math.round(game.basePrice * 0.3),
  category: game.genre[0] ?? 'action',
  rating: 0, // Will be fetched dynamically via useGameRating hook
  cover: game.coverUrl ?? 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp'
});

export default function GamesPage() {
  const [games, setGames] = useState<GameCardContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError('');
      try {
        const searchParams = new URLSearchParams();
        
        const search = params?.get('q');
        const genres = params?.get('genres');
        const regions = params?.get('regions');
        const safeOnly = params?.get('safeOnly');
        
        if (search) searchParams.set('search', search);
        if (genres) {
          // Backend expects single genre, so we'll use the first one or handle multiple client-side
          const genreList = genres.split(',');
          if (genreList.length > 0) searchParams.set('genre', genreList[0]);
        }
        if (regions) {
          const regionList = regions.split(',');
          if (regionList.length > 0) searchParams.set('region', regionList[0]);
        }
        if (safeOnly === 'true') searchParams.set('safeOnly', 'true');
        
        const queryString = searchParams.toString();
        const url = queryString 
          ? `${API_BASE_URL}/api/games?${queryString}`
          : `${API_BASE_URL}/api/games`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('خطا در دریافت بازی‌ها');
        const payload = await response.json();
        const backendGames: BackendGame[] = payload?.data ?? [];
        setGames(backendGames.map(mapGame));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'بارگذاری با خطا مواجه شد.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [params]);

  // Apply all filters client-side
  const filteredGames = useMemo(() => {
    let result = [...games];
    
    // Search query
    const query = params?.get('q')?.trim() ?? '';
    if (query) {
      const normalized = query.toLowerCase();
      result = result.filter((game) => {
        return (
          game.title.toLowerCase().includes(normalized) ||
          game.region.toLowerCase().includes(normalized) ||
          game.platform.toLowerCase().includes(normalized) ||
          game.category.toLowerCase().includes(normalized)
        );
      });
    }
    
    // Platform filter
    const platforms = params?.get('platforms')?.split(',').filter(Boolean) || [];
    if (platforms.length > 0) {
      result = result.filter((game) => 
        platforms.some(p => game.platform.toLowerCase().includes(p.toLowerCase()))
      );
    }
    
    // Genre filter (multiple)
    const genres = params?.get('genres')?.split(',').filter(Boolean) || [];
    if (genres.length > 0) {
      result = result.filter((game) => 
        genres.some(g => game.category.toLowerCase().includes(g.toLowerCase()))
      );
    }
    
    // Region filter (multiple)
    const regions = params?.get('regions')?.split(',').filter(Boolean) || [];
    if (regions.length > 0) {
      result = result.filter((game) => 
        regions.some(r => game.region.toLowerCase().includes(r.toLowerCase()))
      );
    }
    
    // Price range filter
    const minPrice = params?.get('minPrice') ? Number(params.get('minPrice')) : 0;
    const maxPrice = params?.get('maxPrice') ? Number(params.get('maxPrice')) : 10000000;
    result = result.filter((game) => 
      game.price >= minPrice && game.price <= maxPrice
    );
    
    // Safe account filter
    const safeOnly = params?.get('safeOnly') === 'true';
    if (safeOnly) {
      result = result.filter((game) => game.safe);
    }
    
    // Sort
    const sort = params?.get('sort') || 'newest';
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title, 'fa');
        case 'oldest':
          return 0; // Would need createdAt from backend
        default: // newest
          return 0; // Would need createdAt from backend
      }
    });
    
    return result;
  }, [games, params]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (params?.get('platforms')) count++;
    if (params?.get('genres')) count++;
    if (params?.get('regions')) count++;
    if (params?.get('minPrice') || params?.get('maxPrice')) count++;
    if (params?.get('safeOnly') === 'true') count++;
    return count;
  }, [params]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header Section */}
        <div className="rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black mb-2">لیست بازی‌ها</h1>
                <p className="text-sm text-slate-200">جستجو و فیلتر کنید تا بازی مورد نظر خود را پیدا کنید</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-300">
                <Icon name="package" size={18} />
                <span>{filteredGames.length} بازی</span>
              </div>
            </div>
            <SearchBar />
          </div>
        </div>

        {/* Filters and Results Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <GameFilters />
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                  <Icon name="check" size={16} />
                  <span className="font-semibold">{activeFiltersCount} فیلتر فعال</span>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-600">
              نمایش <span className="font-bold text-slate-900">{filteredGames.length}</span> از{' '}
              <span className="font-bold text-slate-900">{games.length}</span> بازی
            </div>
          </div>
          <ActiveFilters />
        </div>

        {/* Featured Games Carousel - Only show when no filters are active */}
        {!loading && !error && activeFiltersCount === 0 && !params?.get('q') && games.length > 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <GameCarousel 
              games={games.slice(0, 12)} 
              title="بازی‌های پربازدید"
              autoPlay={true}
              autoPlayInterval={4000}
            />
          </div>
        )}

        {loading && (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-72 rounded-3xl bg-white shadow animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
            {error}
          </div>
        )}

        {!loading && !error && filteredGames.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="flex justify-center mb-4">
              <Icon name="search" size={48} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">نتیجه‌ای یافت نشد</h3>
            <p className="text-sm text-slate-500 mb-4">
              {params?.get('q') 
                ? `نتیجه‌ای برای «${params.get('q')}» پیدا نشد.`
                : 'با تغییر فیلترها دوباره تلاش کنید.'}
            </p>
            {(activeFiltersCount > 0 || params?.get('q')) && (
              <button
                onClick={() => router.push('/games')}
                className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition"
              >
                پاک کردن همه فیلترها
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredGames.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {filteredGames.map((game) => (
              <div key={game.id} className="w-full">
                <GameCard game={game} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
