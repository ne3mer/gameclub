'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { formatToman } from '@/lib/format';
import type { GameCardContent } from '@/data/home';
import { Icon } from '@/components/icons/Icon';
import { useGameRating } from '@/hooks/useGameRating';

interface Props {
  game: GameCardContent;
}

export const GameCard = ({ game }: Props) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const slug = game.slug ?? game.id;
  const { rating: dynamicRating, reviewCount } = useGameRating(game.id);
  
  // Use dynamic rating if available, otherwise fall back to game.rating
  const displayRating = dynamicRating !== null && dynamicRating > 0 ? dynamicRating : (game.rating || 0);

  const handleCardClick = () => {
    router.push(`/games/${slug}`);
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      setLoading(true);
      await addToCart(game.id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('لطفاً برای خرید وارد حساب کاربری شوید');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex w-full h-full cursor-pointer flex-col overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
    >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl animate-pulse" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl animate-pulse delay-300" />
        </div>

        {/* Game Cover Image */}
        <div className="relative h-64 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-10" />
          <Image
            src={game.cover}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 300px, 360px"
            className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          
          {/* Platform & Region Badges */}
          <div className="absolute left-3 top-3 z-20 flex gap-2">
            <span className="rounded-full bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white shadow-lg border border-white/10">
              {game.platform}
            </span>
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-slate-900 shadow-lg">
              {game.region}
            </span>
          </div>

          {/* Safe Account Badge */}
          {game.safe && (
            <div className="absolute right-3 top-3 z-20">
              <span className="relative rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 text-xs font-black text-white shadow-lg">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative">SAFE</span>
              </span>
            </div>
          )}

          {/* Rating Stars */}
          {displayRating > 0 && (
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-sm px-3 py-1.5">
              <Icon name="star" size={14} className="text-yellow-400 fill-yellow-400" strokeWidth={0} />
              <span className="text-xs font-bold text-white">{displayRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="relative z-10 flex flex-1 flex-col p-5 text-white">
          {/* Title & Category */}
          <div className="mb-3">
            <h3 className="text-xl font-black text-white mb-1 line-clamp-1">{game.title}</h3>
            {displayRating > 0 && (
              <p className="text-xs text-slate-400">
                امتیاز کاربران: {displayRating.toFixed(1)} ⭐
                {reviewCount > 0 && ` (${reviewCount} نظر)`}
              </p>
            )}
          </div>

          {/* Price Section */}
          <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {formatToman(game.price)}
              </span>
              <span className="text-sm font-medium text-slate-300">تومان</span>
            </div>
            {game.monthlyPrice && (
              <p className="text-xs text-slate-400 mt-1">
                عضویت GameClub: {formatToman(game.monthlyPrice)} تومان / ماه
              </p>
            )}
          </div>

          {/* Features Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              game.safe 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
            }`}>
              <Icon name={game.safe ? 'shield' : 'zap'} size={12} strokeWidth={2.5} />
              {game.safe ? 'ضد بن' : 'استاندارد'}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 text-xs font-semibold">
              <Icon name="zap" size={12} strokeWidth={2.5} />
              تحویل فوری
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 text-xs font-semibold">
              <Icon name="message" size={12} strokeWidth={2.5} />
              پشتیبانی آنلاین
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(e);
              }}
              disabled={loading}
              className="group/btn flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3.5 text-sm font-black text-white shadow-lg transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/50 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  در حال افزودن...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="cart" size={16} className="text-white" />
                  افزودن به سبد
                </span>
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/games/${slug}`);
              }}
              className="rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-white/20 hover:border-white/40"
            >
              جزئیات
            </button>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-[32px] border-2 border-transparent transition-all duration-500 group-hover:border-emerald-500/50 pointer-events-none" />
      </article>
  );
};
