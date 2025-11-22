'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatToman } from '@/lib/format';
import { Icon } from '@/components/icons/Icon';

export type CompactGame = {
  id: string;
  slug: string;
  title: string;
  cover: string;
  platform: string;
  price: number;
  tag?: string;
  productType?: string;
};

export const CompactGameCard = ({ game }: { game: CompactGame }) => {
  // Helper to get product type icon
  const getProductTypeIcon = (type?: string) => {
    switch (type) {
      case 'physical_product':
      case 'action_figure':
        return { icon: 'package', color: 'text-purple-500' };
      case 'gaming_gear':
        return { icon: 'headset', color: 'text-indigo-500' };
      case 'digital_content':
        return { icon: 'book', color: 'text-cyan-500' };
      case 'collectible':
      case 'collectible_card':
        return { icon: 'gem', color: 'text-amber-500' };
      case 'apparel':
        return { icon: 'shirt', color: 'text-pink-500' };
      default:
        return null;
    }
  };

  const typeInfo = getProductTypeIcon(game.productType);

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group flex gap-4 rounded-3xl border border-[#e5e5ea] bg-white/90 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-[#f5f6fa]">
        <Image
          src={game.cover}
          alt={game.title}
          fill
          sizes="80px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-[#f5f5f7] px-2 py-0.5 font-semibold">{game.platform}</span>
          {game.tag && (
            <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 font-semibold text-[#4c5fd5]">
              {game.tag}
            </span>
          )}
          {typeInfo && (
            <span className={`flex items-center justify-center rounded-full bg-slate-50 p-1 ${typeInfo.color}`}>
              <Icon name={typeInfo.icon as any} size={12} />
            </span>
          )}
        </div>
        <h3 className="truncate text-base font-semibold text-slate-900">{game.title}</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-slate-900">{formatToman(game.price)} تومان</p>
          <svg
            className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0a84ff]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
