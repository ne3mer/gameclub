'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import type { GameCardContent } from '@/data/home';

interface MinimalGameCardProps {
  game: GameCardContent;
}

export function MinimalGameCard({ game }: MinimalGameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className="group block relative">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-slate-100">
        <Image
          src={game.cover}
          alt={game.title}
          fill
          className="object-cover transition duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay Gradient (visible on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100"></div>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {game.safe && (
            <span className="inline-flex h-6 items-center rounded-full bg-emerald-500/90 px-2.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md shadow-sm">
              Safe
            </span>
          )}
          <span className="inline-flex h-6 items-center rounded-full bg-white/90 px-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-900 backdrop-blur-md shadow-sm">
            {game.region}
          </span>
        </div>

        {/* Hover Action */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <button className="w-full rounded-xl bg-white py-3 text-xs font-bold uppercase tracking-widest text-slate-900 shadow-lg transition hover:bg-emerald-500 hover:text-white">
            مشاهده جزئیات
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1 px-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="line-clamp-1 text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
            {game.title}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-slate-900">
              {game.price.toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] font-medium text-slate-400">تومان</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="capitalize">{game.platform}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
          <span className="capitalize">{game.category}</span>
        </div>
      </div>
    </Link>
  );
}
