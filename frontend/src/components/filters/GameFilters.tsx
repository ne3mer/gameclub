'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { X, ChevronDown } from 'lucide-react';

type FilterState = {
  platforms: string[];
  genres: string[];
  regions: string[];
  priceRange: { min: number; max: number };
  safeOnly: boolean;
  sort: string;
};

const PLATFORMS = ['PS4', 'PS5', 'Xbox', 'PC', 'Nintendo Switch'];
const GENRES = ['Action', 'Adventure', 'RPG', 'Sports', 'Racing', 'Fighting', 'Shooter', 'Strategy', 'Simulation'];
const REGIONS = ['R1', 'R2', 'R3', 'US', 'EU', 'JP'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'oldest', label: 'قدیمی‌ترین' },
  { value: 'price-low', label: 'قیمت: کم به زیاد' },
  { value: 'price-high', label: 'قیمت: زیاد به کم' },
  { value: 'name', label: 'نام: الفبایی' }
];

export function GameFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    platforms: [],
    genres: [],
    regions: [],
    priceRange: { min: 0, max: 10000000 },
    safeOnly: false,
    sort: 'newest'
  });

  useEffect(() => {
    // Initialize from URL params
    const platforms = params?.get('platforms')?.split(',').filter(Boolean) || [];
    const genres = params?.get('genres')?.split(',').filter(Boolean) || [];
    const regions = params?.get('regions')?.split(',').filter(Boolean) || [];
    const minPrice = params?.get('minPrice') ? Number(params.get('minPrice')) : 0;
    const maxPrice = params?.get('maxPrice') ? Number(params.get('maxPrice')) : 10000000;
    const safeOnly = params?.get('safeOnly') === 'true';
    const sort = params?.get('sort') || 'newest';

    setFilters({
      platforms,
      genres,
      regions,
      priceRange: { min: minPrice, max: maxPrice },
      safeOnly,
      sort
    });
  }, [params]);

  const updateURL = (newFilters: FilterState) => {
    const searchParams = new URLSearchParams();
    
    if (newFilters.platforms.length > 0) {
      searchParams.set('platforms', newFilters.platforms.join(','));
    }
    if (newFilters.genres.length > 0) {
      searchParams.set('genres', newFilters.genres.join(','));
    }
    if (newFilters.regions.length > 0) {
      searchParams.set('regions', newFilters.regions.join(','));
    }
    if (newFilters.priceRange.min > 0) {
      searchParams.set('minPrice', newFilters.priceRange.min.toString());
    }
    if (newFilters.priceRange.max < 10000000) {
      searchParams.set('maxPrice', newFilters.priceRange.max.toString());
    }
    if (newFilters.safeOnly) {
      searchParams.set('safeOnly', 'true');
    }
    if (newFilters.sort !== 'newest') {
      searchParams.set('sort', newFilters.sort);
    }

    // Preserve search query
    const query = params?.get('q');
    if (query) {
      searchParams.set('q', query);
    }

    router.push(`/games?${searchParams.toString()}`);
  };

  const toggleFilter = (type: 'platforms' | 'genres' | 'regions', value: string) => {
    const newFilters = { ...filters };
    const array = newFilters[type];
    const index = array.indexOf(value);
    
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(value);
    }
    
    updateURL(newFilters);
  };

  const handlePriceChange = (field: 'min' | 'max', value: number) => {
    const newFilters = {
      ...filters,
      priceRange: { ...filters.priceRange, [field]: value }
    };
    updateURL(newFilters);
  };

  const handleSafeToggle = () => {
    const newFilters = { ...filters, safeOnly: !filters.safeOnly };
    updateURL(newFilters);
  };

  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sort: value };
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const query = params?.get('q');
    router.push(query ? `/games?q=${query}` : '/games');
  };

  const activeFilterCount = filters.platforms.length + filters.genres.length + filters.regions.length + 
    (filters.safeOnly ? 1 : 0) + (filters.priceRange.min > 0 || filters.priceRange.max < 10000000 ? 1 : 0);

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200"
      >
        <Icon name="filter" size={18} />
        <span>فیلترها</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown 
          size={18} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-2xl md:left-auto md:w-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Icon name="filter" size={20} />
                فیلترها و مرتب‌سازی
              </h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                  >
                    <X size={14} />
                    پاک کردن همه
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-1.5 hover:bg-slate-100 transition"
                >
                  <X size={18} className="text-slate-600" />
                </button>
              </div>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Sort */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">مرتب‌سازی</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platforms */}
              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">پلتفرم</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => toggleFilter('platforms', platform)}
                      className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition-all ${
                        filters.platforms.includes(platform)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">ژانر</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleFilter('genres', genre)}
                      className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition-all ${
                        filters.genres.includes(genre)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regions */}
              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">منطقه</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleFilter('regions', region)}
                      className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition-all ${
                        filters.regions.includes(region)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">محدوده قیمت</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">حداقل (تومان)</label>
                    <input
                      type="number"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange('min', Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">حداکثر (تومان)</label>
                    <input
                      type="number"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange('max', Number(e.target.value) || 10000000)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      placeholder="10000000"
                    />
                  </div>
                </div>
              </div>

              {/* Safe Account */}
              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">ویژگی‌های خاص</label>
                <button
                  type="button"
                  onClick={handleSafeToggle}
                  className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
                    filters.safeOnly
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="shield" size={20} className={filters.safeOnly ? 'text-emerald-600' : 'text-slate-400'} />
                    <span className={`text-sm font-bold ${filters.safeOnly ? 'text-emerald-700' : 'text-slate-600'}`}>
                      فقط اکانت‌های Safe
                    </span>
                  </div>
                  <div className={`h-5 w-9 rounded-full transition-colors ${
                    filters.safeOnly ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}>
                    <div className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                      filters.safeOnly ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
