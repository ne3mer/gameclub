'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { sampleReviews } from '@/data/catalog';
import { formatToman } from '@/lib/format';
import { CreativeBanner } from '@/components/sections/CreativeBanner';
import { API_BASE_URL } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

type BackendGame = {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailedDescription?: string;
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;
  safeAccountAvailable: boolean;
  coverUrl?: string;
  tags: string[];
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    id: string;
    selectedOptions: Record<string, string>;
    price: number;
    stock: number;
  }[];
};

export default function GameDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [game, setGame] = useState<BackendGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<any>(null);

  useEffect(() => {
    if (game?.options?.length) {
      const initial: Record<string, string> = {};
      game.options.forEach((opt) => {
        initial[opt.name] = opt.values[0];
      });
      setSelectedOptions(initial);
    }
  }, [game]);

  useEffect(() => {
    if (!game?.variants?.length) {
      setCurrentVariant(null);
      return;
    }
    const variant = game.variants.find((v) =>
      Object.entries(selectedOptions).every(([k, val]) => v.selectedOptions[k] === val)
    );
    setCurrentVariant(variant || null);
  }, [selectedOptions, game]);

  const currentPrice = currentVariant ? currentVariant.price : game?.basePrice || 0;

  useEffect(() => {
    const fetchGame = async () => {
      const slug = params?.slug as string;
      if (!slug) return;

      try {
        // First try to get all games and find by slug
        const response = await fetch(`${API_BASE_URL}/api/games`);
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات بازی');
        
        const data = await response.json();
        const games: BackendGame[] = data.data || [];
        const decodedSlug = decodeURIComponent(slug);
        const foundGame = games.find((g) => g.slug === decodedSlug || g.id === decodedSlug);
        
        if (!foundGame) {
          console.error('Game not found for slug:', slug);
          setError('بازی پیدا نشد');
        } else {
          setGame(foundGame);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری بازی');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="bg-slate-50 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[32px] bg-white p-6 shadow-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-96 bg-slate-200 rounded-3xl" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="bg-slate-50 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[32px] bg-rose-50 border border-rose-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-rose-900">بازی پیدا نشد</h1>
            <p className="text-sm text-rose-600 mt-2">{error || 'این بازی در دیتابیس موجود نیست'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Default values for missing fields
  const defaultCover = game.coverUrl || 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp';
  const gallery = [defaultCover, defaultCover, defaultCover, defaultCover];
  const guarantee = [
    'گارانتی ۷ روزه تعویض در صورت هرگونه مشکل',
    'پشتیبانی ۲۴ ساعته تلگرام و واتساپ',
    'تحویل فوری اطلاعات اکانت پس از پرداخت'
  ];
  const activationSteps = [
    'وارد تنظیمات PS5 شوید و گزینه Users and Accounts را انتخاب کنید',
    'روی Add User کلیک کنید و ایمیل و رمز عبور دریافتی را وارد کنید',
    'پس از ورود، به Library بروید و بازی خریداری شده را دانلود کنید',
    'بازی را با اکانت اصلی خود اجرا کنید و لذت ببرید!'
  ];

  return (
    <div className="bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="grid gap-6 rounded-[32px] bg-white p-6 shadow-lg md:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            <div className="relative h-80 w-full overflow-hidden rounded-3xl">
              <Image src={defaultCover} alt={game.title} fill sizes="360px" className="object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {gallery.slice(0, 4).map((shot, idx) => (
                <div key={idx} className="relative h-32 overflow-hidden rounded-2xl">
                  <Image src={shot} alt={game.title} fill sizes="160px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-xs text-emerald-600">{game.platform}</p>
              <h1 className="text-3xl font-black text-slate-900">{game.title}</h1>
              <p className="text-sm text-slate-500">{game.description}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">قیمت</p>
              <p className="text-3xl font-black text-slate-900">{formatToman(currentPrice)} تومان</p>
              {game.safeAccountAvailable && (
                <p className="text-sm text-emerald-600">Safe Account موجود است</p>
              )}
              <div className="mt-4 space-y-3">
                {game.options?.map((opt) => (
                  <div key={opt.id}>
                    <label className="mb-1 block text-xs font-bold text-slate-700">{opt.name}</label>
                    <select
                      value={selectedOptions[opt.name] || ''}
                      onChange={(e) => setSelectedOptions((prev) => ({ ...prev, [opt.name]: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      {opt.values.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="rounded-full bg-white px-4 py-2 font-semibold text-slate-700">
                  {game.safeAccountAvailable ? 'Safe Account' : 'استاندارد'}
                </span>
              </div>
              <div className="mt-5 flex gap-3">
                <button 
                  onClick={async () => {
                    try {
                      await addToCart(game.id, 1, currentVariant?.id, selectedOptions);
                      alert('به سبد خرید اضافه شد');
                    } catch (err) {
                      alert('لطفاً وارد حساب کاربری شوید');
                    }
                  }}
                  className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
                >
                  افزودن به سبد
                </button>
                <button className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">هشدار قیمت</button>
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-slate-700">
              <p className="text-xs font-semibold text-emerald-700">ضمانت GameClub</p>
              <ul className="mt-3 list-disc space-y-2 pr-5">
                {guarantee.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Detailed Description */}
        {game.detailedDescription && (
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">توضیحات کامل</h2>
            <div 
              className="prose prose-sm max-w-none text-slate-600"
              dangerouslySetInnerHTML={{ __html: game.detailedDescription }}
            />
          </section>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">مشخصات و ژانر</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>پلتفرم: {game.platform}</p>
              <p>منطقه: {game.regionOptions.join(', ')}</p>
              <p>ژانر: {game.genre.join(', ')}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {game.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-50 px-3 py-1 font-semibold text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
          <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">مراحل فعال‌سازی</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              {activationSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-600">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </article>
        </section>

        <CreativeBanner />

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">نظرات کاربران</h2>
              <p className="text-sm text-slate-500">میانگین امتیاز ۴.۵ از ۵</p>
            </div>
            <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">ثبت نظر</button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {sampleReviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{review.user}</p>
                    <p className="text-xs text-slate-500">{review.handle}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600">{review.rating} ⭐️</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{review.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
