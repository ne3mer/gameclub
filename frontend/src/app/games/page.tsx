'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import type { GameCardContent } from '@/data/home';
import { Icon } from '@/components/icons/Icon';
import { MinimalHero } from '@/components/games/MinimalHero';
import { MinimalGameCard } from '@/components/games/MinimalGameCard';
import { MinimalPagination } from '@/components/games/MinimalPagination';
import { FilterAccordion } from '@/components/games/FilterAccordion';

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
  productType?: string;
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
  rating: 0,
  cover: game.coverUrl ?? 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp',
  description: game.description ?? '',
  tags: game.genre?.slice(0, 3) ?? [],
  productType: game.productType as any
});

const PER_PAGE = 12;

function GamesContent() {
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
        if (!response.ok) throw new Error('Failed to load games');
        const payload = await response.json();
        const backendGames: BackendGame[] = payload?.data ?? [];
        setGames(backendGames.map(mapGame));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [params]);

  const filteredGames = useMemo(() => {
    let result = [...games];
    
    // Search query
    const query = params?.get('q')?.trim() ?? '';
    if (query) {
      const normalized = query.toLowerCase();
      result = result.filter((game) => {
        return (
          game.title.toLowerCase().includes(normalized) ||
          (game.region && game.region.toLowerCase().includes(normalized)) ||
          (game.platform && game.platform.toLowerCase().includes(normalized)) ||
          game.category.toLowerCase().includes(normalized)
        );
      });
    }
    
    // Platform filter
    const platforms = params?.get('platforms')?.split(',').filter(Boolean) || [];
    if (platforms.length > 0) {
      result = result.filter((game) => 
        game.platform && platforms.some(p => game.platform!.toLowerCase().includes(p.toLowerCase()))
      );
    }
    
    // Genre filter
    const genres = params?.get('genres')?.split(',').filter(Boolean) || [];
    if (genres.length > 0) {
      result = result.filter((game) => 
        genres.some(g => game.category.toLowerCase().includes(g.toLowerCase()))
      );
    }
    
    // Region filter
    const regions = params?.get('regions')?.split(',').filter(Boolean) || [];
    if (regions.length > 0) {
      result = result.filter((game) => 
        game.region && regions.some(r => game.region!.toLowerCase().includes(r.toLowerCase()))
      );
    }
    
    // Price filter
    const minPrice = params?.get('minPrice') ? Number(params.get('minPrice')) : 0;
    const maxPrice = params?.get('maxPrice') ? Number(params.get('maxPrice')) : 10000000;
    result = result.filter((game) => 
      game.price >= minPrice && game.price <= maxPrice
    );
    
    // Safe filter
    const safeOnly = params?.get('safeOnly') === 'true';
    if (safeOnly) {
      result = result.filter((game) => game.safe);
    }
    
    // Sort
    const sort = params?.get('sort') || 'newest';
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.title.localeCompare(b.title, 'fa');
        default: return 0;
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

  const pageParam = params?.get('page') ?? '1';
  const parsedPage = Number(pageParam);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * PER_PAGE;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + PER_PAGE);

  const updateQuery = (updates: Record<string, string | null>, options: { resetPage?: boolean } = {}) => {
    const current = new URLSearchParams(params?.toString());
    if (options.resetPage) current.delete('page');
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) current.delete(key);
      else current.set(key, value);
    });
    const query = current.toString();
    router.push(query ? `/games?${query}` : '/games');
  };

  const handleClearFilters = () => router.push('/games');
  const changePage = (page: number) => updateQuery({ page: String(page) });

  const sortOptions = [
    { value: 'newest', label: 'جدیدترین' },
    { value: 'price-low', label: 'قیمت: کم به زیاد' },
    { value: 'price-high', label: 'قیمت: زیاد به کم' },
    { value: 'name', label: 'نام' }
  ];
  const currentSort = params?.get('sort') ?? 'newest';

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      
      {/* Hero Section */}
      <MinimalHero totalGames={games.length} filteredCount={filteredGames.length} />

      {/* Filter Accordion */}
      <FilterAccordion activeFiltersCount={activeFiltersCount} onClearFilters={handleClearFilters} />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-12 py-8 md:py-12">
        
        {/* Sort & Results Header */}
        <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-center md:justify-between mb-8 md:mb-10">
          <p className="text-xs md:text-sm font-medium text-slate-500">
            نمایش <span className="font-bold text-slate-900">{(startIndex + 1).toLocaleString('fa-IR')}-{Math.min(startIndex + paginatedGames.length, filteredGames.length).toLocaleString('fa-IR')}</span> از <span className="font-bold text-slate-900">{filteredGames.length.toLocaleString('fa-IR')}</span> بازی
          </p>
          
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateQuery({ sort: option.value === 'newest' ? null : option.value }, { resetPage: true })}
                className={`rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold tracking-wide transition ${
                  currentSort === option.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:gap-x-8 md:gap-y-12 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="aspect-[3/4] rounded-2xl md:rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl md:rounded-3xl bg-rose-50 p-8 md:p-12 text-center">
            <p className="text-rose-500 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm font-bold underline">تلاش مجدد</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredGames.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-slate-50 flex items-center justify-center mb-4 md:mb-6">
              <Icon name="search" size={24} className="text-slate-300 md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">بازی‌ای یافت نشد</h3>
            <p className="text-sm md:text-base text-slate-500 max-w-md mx-auto px-4">
              متأسفانه بازی‌ای با فیلترهای انتخابی شما پیدا نشد. لطفاً فیلترهای خود را تغییر دهید یا آن‌ها را پاک کنید.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-6 md:mt-8 rounded-full bg-slate-900 px-6 py-2.5 md:px-8 md:py-3 text-xs md:text-sm font-bold text-white transition hover:bg-slate-800"
            >
              پاک کردن همه فیلترها
            </button>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && filteredGames.length > 0 && (
          <>
            <div className="grid gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:gap-x-8 md:gap-y-12 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {paginatedGames.map((game) => (
                <MinimalGameCard key={game.id} game={game} />
              ))}
            </div>
            
            <MinimalPagination 
              currentPage={safeCurrentPage} 
              totalPages={totalPages} 
              onPageChange={changePage} 
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-emerald-500"></div>
      </div>
    }>
      <GamesContent />
    </Suspense>
  );
}
