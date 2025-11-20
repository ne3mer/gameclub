'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameCard } from '@/components/cards/GameCard';
import { API_BASE_URL } from '@/lib/api';
import type { GameCardContent } from '@/data/home';
import { SearchBar } from '@/components/filters/SearchBar';

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
  rating: 4.8,
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
        const response = await fetch(`${API_BASE_URL}/api/games`);
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
  }, []);

  const query = params?.get('q')?.trim() ?? '';
  const filteredGames = useMemo(() => {
    if (!query) return games;
    const normalized = query.toLowerCase();
    return games.filter((game) => {
      return (
        game.title.toLowerCase().includes(normalized) ||
        game.region.toLowerCase().includes(normalized) ||
        game.platform.toLowerCase().includes(normalized)
      );
    });
  }, [games, query]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-[32px] bg-slate-900 px-6 py-8 text-white">
          <div className="space-y-3">
            <h1 className="text-3xl font-black">لیست بازی‌ها</h1>
            <p className="text-sm text-slate-200">نام بازی، ژانر یا منطقه مدنظر خود را جستجو کنید.</p>
            <SearchBar />
          </div>
        </div>

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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            نتیجه‌ای برای «{query}» پیدا نشد.
          </div>
        )}

        {!loading && !error && filteredGames.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
