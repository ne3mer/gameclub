'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import type { ProductCardContent } from '@/data/home';

interface MinimalGameCardProps {
  game: ProductCardContent;
}

export function MinimalGameCard({ game }: MinimalGameCardProps) {
  // Helper to get product type icon and label
  const getProductTypeInfo = (type?: string) => {
    switch (type) {
      case 'physical_product':
      case 'action_figure':
        return { label: 'فیزیکی', color: 'bg-purple-500/90' };
      case 'gaming_gear':
        return { label: 'تجهیزات', color: 'bg-indigo-500/90' };
      case 'digital_content':
        return { label: 'محتوا', color: 'bg-cyan-500/90' };
      case 'collectible':
      case 'collectible_card':
        return { label: 'کلکسیونی', color: 'bg-amber-500/90' };
      case 'apparel':
        return { label: 'لباس', color: 'bg-pink-500/90' };
      default:
        return null;
    }
  };

  const typeInfo = getProductTypeInfo(game.productType);

  return (
    <Link href={`/games/${game.slug}`} className="group block relative">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl md:rounded-3xl bg-slate-100">
        <Image
          src={game.cover}
          alt={game.title}
          fill
          className="object-cover transition duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Overlay Gradient (visible on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100"></div>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {typeInfo && (
            <span className={`inline-flex h-5 md:h-6 items-center rounded-full px-2 md:px-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md shadow-sm ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          )}
          {game.safe && (
            <span className="inline-flex h-5 md:h-6 items-center rounded-full bg-emerald-500/90 px-2 md:px-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md shadow-sm">
              Safe
            </span>
          )}
          <span className="inline-flex h-5 md:h-6 items-center rounded-full bg-white/90 px-2 md:px-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-slate-900 backdrop-blur-md shadow-sm">
            {game.region || 'Global'}
          </span>
        </div>

        {/* Hover Action - Desktop Only */}
        <div className="hidden md:block absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <button className="w-full rounded-xl bg-white py-3 text-xs font-bold uppercase tracking-widest text-slate-900 shadow-lg transition hover:bg-emerald-500 hover:text-white">
            مشاهده جزئیات
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 md:mt-4 space-y-1 px-1">
        <div className="flex items-start justify-between gap-2 md:gap-4">
          <h3 className="line-clamp-1 text-base md:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
            {game.title}
          </h3>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-sm md:text-base font-black text-slate-900">
              {game.price.toLocaleString('fa-IR')}
            </span>
            <span className="text-[9px] md:text-[10px] font-medium text-slate-400">تومان</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-slate-500">
          <span className="capitalize">{game.platform}</span>
          <span className="h-0.5 w-0.5 md:h-1 md:w-1 rounded-full bg-slate-300"></span>
          <span className="capitalize">{game.category}</span>
        </div>
      </div>
    </Link>
  );
}
