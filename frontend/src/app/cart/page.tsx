'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { formatToman } from '@/lib/format';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (loading && !cart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-slate-100 p-6">
          <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">سبد خرید شما خالی است</h2>
        <p className="text-slate-500">هنوز هیچ محصولی به سبد خرید خود اضافه نکرده‌اید.</p>
        <Link
          href="/games"
          className="mt-4 rounded-2xl bg-emerald-500 px-8 py-3 font-bold text-white transition hover:bg-emerald-600"
        >
          مشاهده بازی‌ها
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-2xl font-black text-slate-900">سبد خرید</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div
                key={item.gameId.id}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  {item.gameId.coverUrl ? (
                    <Image
                      src={item.gameId.coverUrl}
                      alt={item.gameId.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      بدون تصویر
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <Link href={`/games/${item.gameId.slug}`} className="font-bold text-slate-900 hover:text-emerald-600">
                    {item.gameId.title}
                  </Link>
                  <div className="text-sm text-slate-500">
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0
                      ? Object.entries(item.selectedOptions)
                          .map(([k, v]) => `${v}`)
                          .join(' | ')
                      : `${item.gameId.platform} / استاندارد`}
                  </div>
                  <div className="font-bold text-slate-900">{formatToman(item.priceAtAdd)} تومان</div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1">
                    <button
                      onClick={() => updateQuantity(item.gameId.id, item.quantity - 1)}
                      className="text-slate-500 hover:text-slate-900"
                      disabled={loading}
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.gameId.id, item.quantity + 1)}
                      className="text-slate-500 hover:text-slate-900"
                      disabled={loading}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.gameId.id)}
                    className="rounded-xl bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                    disabled={loading}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">خلاصه سفارش</h2>
            
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>قیمت کالاها ({cart.items.length})</span>
                <span>{formatToman(totalPrice)} تومان</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>تخفیف</span>
                <span className="text-emerald-600">0 تومان</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-lg font-black text-slate-900">
              <span>مبلغ قابل پرداخت</span>
              <span>{formatToman(totalPrice)} تومان</span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-2xl bg-emerald-500 py-3 text-center font-bold text-white transition hover:bg-emerald-600"
            >
              ادامه فرآیند خرید
            </Link>
            
            <p className="mt-4 text-center text-xs text-slate-400">
              با نهایی کردن خرید، قوانین و مقررات GameClub را می‌پذیرید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
