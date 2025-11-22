'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { formatToman } from '@/lib/format';
import type { ProductCardContent } from '@/data/home';
import { Icon } from '@/components/icons/Icon';
import { useGameRating } from '@/hooks/useGameRating';

interface Props {
  game: ProductCardContent;
}

export const ProductCard = ({ game }: Props) => {
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

  // Helper to get product type icon and label
  const getProductTypeInfo = (type?: string) => {
    switch (type) {
      case 'physical_product':
      case 'action_figure':
        return { icon: 'package', label: 'فیزیکی', color: 'bg-purple-50 text-purple-600 border-purple-200' };
      case 'gaming_gear':
        return { icon: 'headset', label: 'تجهیزات', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
      case 'digital_content':
        return { icon: 'book', label: 'محتوا', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' };
      case 'collectible':
      case 'collectible_card':
        return { icon: 'gem', label: 'کلکسیونی', color: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'apparel':
        return { icon: 'shirt', label: 'لباس', color: 'bg-pink-50 text-pink-600 border-pink-200' };
      default:
        return null; // Digital game doesn't need a special badge here
    }
  };

  const typeInfo = getProductTypeInfo(game.productType);

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[32px] border border-[#e5e5ea] bg-white shadow-[0_28px_90px_rgba(17,23,41,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_38px_120px_rgba(17,23,41,0.12)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#dfe3ec] blur-[90px]" />
        <div className="absolute -left-24 -bottom-16 h-56 w-56 rounded-full bg-white blur-[90px]" />
      </div>

      <div className="relative h-64 w-full overflow-hidden bg-slate-100">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent z-10" />
        <Image
          src={game.cover}
          alt={game.title}
          fill
          sizes="(max-width: 768px) 300px, 360px"
          className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />

        <div className="absolute left-3 top-3 z-20 flex gap-2">
          {game.platform && (
            <span className="rounded-full border border-white/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
              {game.platform}
            </span>
          )}
          {game.region && (
            <span className="rounded-full border border-white bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
              {game.region}
            </span>
          )}
          {typeInfo && (
            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm flex items-center gap-1 ${typeInfo.color}`}>
              <Icon name={typeInfo.icon as any} size={12} />
              {typeInfo.label}
            </span>
          )}
        </div>

        {game.safe && (
          <div className="absolute right-3 top-3 z-20">
            <span className="relative rounded-full bg-gradient-to-r from-rose-400 to-orange-400 px-4 py-1.5 text-xs font-black text-white shadow-lg">
              <span className="absolute inset-0 rounded-full bg-orange-200 animate-ping opacity-40" />
              <span className="relative">SAFE</span>
            </span>
          </div>
        )}

        {displayRating > 0 && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 shadow-sm">
            <Icon name="star" size={14} className="text-amber-400" strokeWidth={0} />
            <span className="text-xs font-bold text-slate-800">{displayRating.toFixed(1)}</span>
          </div>
        )}
      </div>

        <div className="relative z-10 flex flex-1 flex-col p-6 text-slate-900">
        <div className="mb-3">
          <h3 className="mb-1 text-xl font-black leading-tight line-clamp-1">{game.title}</h3>
          {displayRating > 0 && (
            <p className="text-xs text-slate-500">
              امتیاز کاربران: {displayRating.toFixed(1)} ⭐
              {reviewCount > 0 && ` (${reviewCount} نظر)`}
            </p>
          )}
        </div>

        <div className="mb-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-[#fff0e1] to-[#ffe9f5] p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{formatToman(game.price)}</span>
            <span className="text-sm font-medium text-slate-500">تومان</span>
          </div>
          {game.monthlyPrice && (
            <p className="mt-1 text-xs text-slate-500">عضویت GameClub: {formatToman(game.monthlyPrice)} تومان / ماه</p>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {game.safe !== undefined && (
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                game.safe
                  ? 'border-[#d1f5dc] bg-[#f1fef4] text-[#1f8a4a]'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <Icon name={game.safe ? 'shield' : 'zap'} size={12} strokeWidth={2.5} />
              {game.safe ? 'ضد بن' : 'استاندارد'}
            </span>
          )}
          
          {/* Inventory Status */}
          {game.inventory && game.inventory.status !== 'in_stock' && (
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
              game.inventory.status === 'out_of_stock' 
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : 'border-amber-200 bg-amber-50 text-amber-600'
            }`}>
              <Icon name="alert" size={12} strokeWidth={2.5} />
              {game.inventory.status === 'out_of_stock' ? 'ناموجود' : 'موجودی کم'}
            </span>
          )}

          {/* Shipping Info */}
          {game.shipping?.freeShipping && (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              <Icon name="truck" size={12} strokeWidth={2.5} />
              ارسال رایگان
            </span>
          )}

          <span className="flex items-center gap-1.5 rounded-full border border-[#dce9ff] bg-[#f3f7ff] px-3 py-1 text-xs font-semibold text-[#0a84ff]">
            <Icon name="zap" size={12} strokeWidth={2.5} />
            تحویل فوری
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
            <Icon name="message" size={12} strokeWidth={2.5} />
            پشتیبانی آنلاین
          </span>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={loading || (game.inventory?.status === 'out_of_stock')}
            className="flex-1 rounded-2xl bg-[#0a84ff] py-3.5 text-sm font-black text-white shadow-lg transition-all duration-300 hover:bg-[#0071e3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                در حال افزودن...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Icon name="cart" size={16} className="text-white" />
                {game.inventory?.status === 'out_of_stock' ? 'ناموجود' : 'افزودن به سبد'}
              </span>
            )}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/games/${slug}`);
            }}
            className="rounded-2xl border border-[#d1d1d6] bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-[#0a84ff]/40 hover:text-[#0a84ff]"
          >
            جزئیات
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-transparent transition-colors duration-500 group-hover:border-[#0a84ff]/30" />
    </article>
  );
};
