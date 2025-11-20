'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { formatToman } from '@/lib/format';
import { CreativeBanner } from '@/components/sections/CreativeBanner';
import { API_BASE_URL } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { PriceAlertModal } from '@/components/alerts/PriceAlertModal';
import { getAuthToken } from '@/lib/auth';
import { Icon } from '@/components/icons/Icon';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { useGameRating, invalidateRatingCache } from '@/hooks/useGameRating';

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
  gallery?: string[];
  tags: string[];
  // Media fields
  trailerUrl?: string;
  gameplayVideoUrl?: string;
  screenshots?: string[];
  // Enhanced metadata
  rating?: number;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  ageRating?: string;
  features?: string[];
  systemRequirements?: {
    minimum?: string;
    recommended?: string;
  };
  // Marketing
  featured?: boolean;
  onSale?: boolean;
  salePrice?: number;
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

// Helper function to extract YouTube/Vimeo video ID
const getVideoEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  return null;
};

export default function GameDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [game, setGame] = useState<BackendGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [existingAlert, setExistingAlert] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'specs' | 'reviews'>('overview');
  const [reviewsKey, setReviewsKey] = useState(0);
  const { rating: gameRating, reviewCount } = useGameRating(game?.id);

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

  const currentPrice = currentVariant ? currentVariant.price : (game?.onSale && game?.salePrice ? game.salePrice : game?.basePrice || 0);
  const originalPrice = game?.onSale && game?.salePrice ? game.basePrice : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  useEffect(() => {
    const fetchGame = async () => {
      const slug = params?.slug as string;
      if (!slug) return;

      try {
        const decodedSlug = decodeURIComponent(slug);
        const response = await fetch(`${API_BASE_URL}/api/games/${decodedSlug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('بازی پیدا نشد');
          } else {
            throw new Error('خطا در دریافت اطلاعات بازی');
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        const foundGame: BackendGame = data.data;
        
        if (!foundGame) {
          setError('بازی پیدا نشد');
        } else {
          setGame(foundGame);
          checkExistingAlert(foundGame.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری بازی');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [params?.slug]);

  const checkExistingAlert = async (gameId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/price-alerts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const alerts = Array.isArray(data?.data) ? data.data : [];
        const alert = alerts.find((a: any) => a.gameId?.id === gameId || a.gameId?._id === gameId);
        if (alert) {
          setExistingAlert({
            id: alert.id || alert._id,
            targetPrice: alert.targetPrice,
            channel: alert.channel,
            destination: alert.destination
          });
        }
      }
    } catch (err) {
      // Silent fail - user might not be logged in
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-slate-200 rounded-3xl" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl bg-white border border-rose-200 p-8 text-center shadow-lg">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-rose-900 mb-2">بازی پیدا نشد</h1>
          <p className="text-sm text-rose-600">{error || 'این بازی در دیتابیس موجود نیست'}</p>
        </div>
      </div>
    );
  }

  const defaultCover = game.coverUrl || 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp';
  const gallery = game.gallery && game.gallery.length > 0 ? game.gallery : [defaultCover];
  const screenshots = game.screenshots && game.screenshots.length > 0 ? game.screenshots : [];
  const allImages = [defaultCover, ...gallery, ...screenshots].filter((img, idx, arr) => arr.indexOf(img) === idx);
  
  const trailerEmbedUrl = game.trailerUrl ? getVideoEmbedUrl(game.trailerUrl) : null;
  const gameplayEmbedUrl = game.gameplayVideoUrl ? getVideoEmbedUrl(game.gameplayVideoUrl) : null;

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
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
            <div className="space-y-6">
              {game.featured && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white">
                  <Icon name="star" size={14} />
                  محصول ویژه
                </span>
              )}
              <div>
                <p className="text-sm text-emerald-400 font-semibold mb-2">{game.platform}</p>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{game.title}</h1>
                <p className="text-lg text-slate-300 leading-relaxed">{game.description}</p>
              </div>
              
              {/* Rating & Metadata */}
              <div className="flex flex-wrap items-center gap-4">
                {gameRating !== null && gameRating > 0 && (
                  <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-2">
                    <Icon name="star" size={18} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-bold">{gameRating.toFixed(1)}</span>
                    {reviewCount > 0 && (
                      <span className="text-xs text-slate-300">({reviewCount})</span>
                    )}
                  </div>
                )}
                {game.releaseDate && (
                  <div className="text-sm text-slate-300">
                    <span className="font-semibold">تاریخ انتشار:</span> {new Date(game.releaseDate).toLocaleDateString('fa-IR')}
                  </div>
                )}
                {game.ageRating && (
                  <div className="rounded-full bg-white/10 backdrop-blur px-4 py-2 text-sm font-bold text-white">
                    {game.ageRating}
                  </div>
                )}
              </div>

              {/* Tags */}
              {game.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold text-white">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div className="relative h-96 md:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src={defaultCover} 
                alt={game.title} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {game.onSale && (
                <div className="absolute top-4 left-4 rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                  {discountPercent}% تخفیف
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 flex">
                {[
                  { id: 'overview', label: 'بررسی', icon: 'file' },
                  { id: 'media', label: 'رسانه', icon: 'image' },
                  { id: 'specs', label: 'مشخصات', icon: 'file' },
                  { id: 'reviews', label: 'نظرات', icon: 'message' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition ${
                      activeTab === tab.id
                        ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon name={tab.icon as any} size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {game.detailedDescription && (
                      <div 
                        className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: game.detailedDescription }}
                      />
                    )}
                    
                    {game.features && game.features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">ویژگی‌های بازی</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {game.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                              <Icon name="check" size={18} className="text-emerald-500 flex-shrink-0" />
                              <span className="text-sm text-slate-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activation Steps */}
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border border-emerald-200">
                      <h3 className="text-xl font-bold text-emerald-900 mb-4">مراحل فعال‌سازی</h3>
                      <ol className="space-y-4">
                        {activationSteps.map((step, index) => (
                          <li key={step} className="flex items-start gap-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white flex-shrink-0 shadow-lg">
                              {index + 1}
                            </span>
                            <span className="text-sm text-emerald-900 leading-relaxed pt-2">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Media Tab */}
                {activeTab === 'media' && (
                  <div className="space-y-8">
                    {/* Trailer */}
                    {trailerEmbedUrl && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">تریلر بازی</h3>
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                          <iframe
                            src={trailerEmbedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Gameplay Video */}
                    {gameplayEmbedUrl && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">ویدیو گیم‌پلی</h3>
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                          <iframe
                            src={gameplayEmbedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Screenshots Gallery */}
                    {screenshots.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">اسکرین‌شات‌ها</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {screenshots.map((screenshot, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedImageIndex(allImages.indexOf(screenshot));
                                setShowImageModal(true);
                              }}
                              className="relative aspect-video rounded-xl overflow-hidden group hover:scale-105 transition-transform shadow-lg"
                            >
                              <Image
                                src={screenshot}
                                alt={`Screenshot ${idx + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Gallery */}
                    {allImages.length > 1 && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">گالری تصاویر</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {allImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedImageIndex(idx);
                                setShowImageModal(true);
                              }}
                              className="relative aspect-square rounded-xl overflow-hidden group hover:scale-105 transition-transform shadow-lg"
                            >
                              <Image
                                src={img}
                                alt={`Gallery ${idx + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Specs Tab */}
                {activeTab === 'specs' && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="rounded-2xl bg-slate-50 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">اطلاعات بازی</h3>
                        <div className="space-y-3 text-sm">
                          {game.platform && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">پلتفرم:</span>
                              <span className="font-semibold text-slate-900">{game.platform}</span>
                            </div>
                          )}
                          {game.genre.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">ژانر:</span>
                              <span className="font-semibold text-slate-900">{game.genre.join(', ')}</span>
                            </div>
                          )}
                          {game.regionOptions.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">منطقه:</span>
                              <span className="font-semibold text-slate-900">{game.regionOptions.join(', ')}</span>
                            </div>
                          )}
                          {game.developer && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">توسعه‌دهنده:</span>
                              <span className="font-semibold text-slate-900">{game.developer}</span>
                            </div>
                          )}
                          {game.publisher && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">ناشر:</span>
                              <span className="font-semibold text-slate-900">{game.publisher}</span>
                            </div>
                          )}
                          {game.releaseDate && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">تاریخ انتشار:</span>
                              <span className="font-semibold text-slate-900">
                                {new Date(game.releaseDate).toLocaleDateString('fa-IR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {game.systemRequirements && (game.systemRequirements.minimum || game.systemRequirements.recommended) && (
                        <div className="rounded-2xl bg-slate-50 p-6">
                          <h3 className="text-lg font-bold text-slate-900 mb-4">نیازمندی‌های سیستم</h3>
                          <div className="space-y-4 text-sm">
                            {game.systemRequirements.minimum && (
                              <div>
                                <h4 className="font-semibold text-slate-700 mb-2">حداقل:</h4>
                                <p className="text-slate-600 whitespace-pre-line">{game.systemRequirements.minimum}</p>
                              </div>
                            )}
                            {game.systemRequirements.recommended && (
                              <div>
                                <h4 className="font-semibold text-slate-700 mb-2">پیشنهادی:</h4>
                                <p className="text-slate-600 whitespace-pre-line">{game.systemRequirements.recommended}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <ReviewForm 
                      gameId={game.id} 
                      onSuccess={() => {
                        setReviewsKey(prev => prev + 1);
                        invalidateRatingCache(game.id);
                      }}
                    />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">نظرات کاربران</h3>
                      <ReviewsList key={reviewsKey} gameId={game.id} />
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Price Card */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 p-6 shadow-xl">
                <div className="mb-6">
                  {originalPrice && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-slate-500 line-through">{formatToman(originalPrice)}</span>
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                        {discountPercent}% تخفیف
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mb-1">قیمت</p>
                  <p className="text-4xl font-black text-slate-900">{formatToman(currentPrice)}</p>
                  <p className="text-sm text-emerald-700 font-semibold mt-1">تومان</p>
                </div>

                {game.options.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {game.options.map((opt) => (
                      <div key={opt.id}>
                        <label className="mb-2 block text-sm font-bold text-slate-700">{opt.name}</label>
                        <select
                          value={selectedOptions[opt.name] || ''}
                          onChange={(e) => setSelectedOptions((prev) => ({ ...prev, [opt.name]: e.target.value }))}
                          className="w-full rounded-xl border-2 border-emerald-200 bg-white px-4 py-3 text-sm font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
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
                )}

                {currentVariant && currentVariant.stock <= 5 && currentVariant.stock > 0 && (
                  <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs font-bold text-amber-800">
                      ⚠️ فقط {currentVariant.stock} عدد باقی مانده!
                    </p>
                  </div>
                )}

                {currentVariant && currentVariant.stock === 0 && (
                  <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3">
                    <p className="text-xs font-bold text-rose-800">❌ موجود نیست</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={async () => {
                      try {
                        await addToCart(game.id, 1, currentVariant?.id, selectedOptions);
                        alert('به سبد خرید اضافه شد');
                      } catch (err) {
                        alert('لطفاً وارد حساب کاربری شوید');
                      }
                    }}
                    disabled={currentVariant && currentVariant.stock === 0}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentVariant && currentVariant.stock === 0 ? 'موجود نیست' : 'افزودن به سبد خرید'}
                  </button>
                  <button 
                    onClick={() => {
                      const token = getAuthToken();
                      if (!token) {
                        alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
                        return;
                      }
                      setShowPriceAlertModal(true);
                    }}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    {existingAlert ? '✏️ ویرایش هشدار قیمت' : '🔔 تنظیم هشدار قیمت'}
                  </button>
                </div>

                {game.safeAccountAvailable && (
                  <div className="mt-4 rounded-xl bg-white/50 backdrop-blur p-3 border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-2">
                      <Icon name="shield" size={16} />
                      Safe Account موجود است
                    </p>
                  </div>
                )}
              </div>

              {/* Guarantee Card */}
              <div className="rounded-3xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-lg">
                <p className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <Icon name="shield" size={18} />
                  ضمانت GameClub
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  {guarantee.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Icon name="check" size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Creative Banner */}
        <div className="mt-8">
          <CreativeBanner />
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-emerald-400 transition"
          >
            <Icon name="x" size={32} />
          </button>
          <div className="relative max-w-5xl w-full h-full flex items-center">
            <Image
              src={allImages[selectedImageIndex]}
              alt={`Image ${selectedImageIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-emerald-400 transition"
              >
                <Icon name="chevron-left" size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-emerald-400 transition"
              >
                <Icon name="chevron-right" size={32} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Price Alert Modal */}
      {game && (
        <PriceAlertModal
          gameId={game.id}
          gameTitle={game.title}
          currentPrice={currentPrice}
          isOpen={showPriceAlertModal}
          onClose={() => {
            setShowPriceAlertModal(false);
            setExistingAlert(null);
          }}
          onSuccess={() => {
            checkExistingAlert(game.id);
          }}
          existingAlert={existingAlert}
        />
      )}
    </div>
  );
}
