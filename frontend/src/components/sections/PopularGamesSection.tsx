'use client';

import { useEffect, useState } from 'react';
import { GameCard } from '@/components/cards/GameCard';
import { API_BASE_URL } from '@/lib/api';
import type { GameCardContent } from '@/data/home';

type BackendGame = {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;
  safeAccountAvailable: boolean;
  coverUrl?: string;
  tags: string[];
};

const mapBackendGameToCard = (game: BackendGame): GameCardContent => ({
  id: game.id,
  slug: game.slug,
  title: game.title,
  platform: game.platform,
  price: game.basePrice,
  region: game.regionOptions[0] || 'R2',
  safe: game.safeAccountAvailable,
  monthlyPrice: Math.floor(game.basePrice * 0.3),
  category: game.genre[0]?.toLowerCase() || 'action',
  rating: 4.5,
  cover: game.coverUrl || 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp'
});

export const PopularGamesSection = () => {
  const [games, setGames] = useState<GameCardContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/games`);
        if (!response.ok) throw new Error('خطا در دریافت بازی‌ها');
        
        const data = await response.json();
        const backendGames: BackendGame[] = data.data || [];
        const mappedGames = backendGames.map(mapBackendGameToCard);
        setGames(mappedGames);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری بازی‌ها');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-emerald-600">پرفروش‌های این هفته</p>
          <h2 className="text-2xl font-semibold text-slate-900">بازی‌های محبوب GameClub</h2>
        </div>
        <button className="text-sm font-semibold text-emerald-600">مشاهده همه</button>
      </div>
      
      {loading && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[280px] h-96 rounded-3xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      )}
      
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center">
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      )}
      
      {!loading && !error && games.length === 0 && (
        <div className="rounded-2xl bg-slate-100 border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-600">هنوز بازی‌ای اضافه نشده است.</p>
          <p className="text-xs text-slate-500 mt-2">از پنل ادمین بازی‌های جدید اضافه کنید.</p>
        </div>
      )}
      
      {!loading && !error && games.length > 0 && (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </section>
  );
};
