import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatToman } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import type { GameCardContent } from '@/data/home';

interface Props {
  game: GameCardContent;
}

export const GameCard = ({ game }: Props) => {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const slug = game.slug ?? game.id;

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
    <Link href={`/games/${slug}`}>
      <article className="group relative flex min-w-[280px] max-w-sm flex-1 cursor-pointer flex-col overflow-hidden rounded-[30px] border border-slate-100 bg-white p-4 shadow-[0_15px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-emerald-200">
        <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 to-transparent" />
        </div>
        <div className="relative h-48 w-full overflow-hidden rounded-2xl">
          <Image
            src={game.cover}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 300px, 360px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex gap-2 text-xs font-bold">
            <span className="rounded-full bg-slate-900/70 px-3 py-1 text-white">{game.platform}</span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-slate-900">{game.region}</span>
          </div>
          {game.safe && (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
              Safe
            </span>
          )}
        </div>
        <div className="relative mt-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{game.title}</h3>
              <p className="text-sm text-slate-500">امتیاز کاربران {game.rating}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              محبوب
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-slate-900">
              {formatToman(game.price)}
              <span className="mr-1 text-sm font-medium text-slate-500">تومان</span>
            </span>
            <span className="text-xs text-slate-500">
              عضویت GameClub: {formatToman(game.monthlyPrice)} تومان / ماه
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full border border-slate-200 px-3 py-1">
              {game.safe ? 'ضد بن' : 'استاندارد'}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">تحویل فوری</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">پشتیبانی آنلاین</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-1 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {loading ? 'در حال افزودن...' : 'افزودن به سبد'}
            </button>
            <span className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
              جزییات
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};
