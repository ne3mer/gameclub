'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatToman } from '@/lib/format';
import { API_BASE_URL } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, loading: cartLoading, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart || cart.items.length === 0) {
      setError('سبد خرید شما خالی است');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get auth token if exists
      const token = localStorage.getItem('gc_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Prepare order items from cart
      const items = cart.items.map(item => ({
        gameId: item.gameId.id,
        variantId: item.variantId,
        selectedOptions: item.selectedOptions,
        pricePaid: item.priceAtAdd,
        quantity: item.quantity
      }));

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerInfo,
          items,
          totalAmount: totalPrice
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'خطا در ثبت سفارش');
      }

      const data = await response.json();
      const orderId = data.data._id;

      try {
        await clearCart();
      } catch (clearError) {
        console.warn('خطا در پاکسازی سبد پس از سفارش', clearError);
      }

      // Redirect to success page
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت سفارش');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
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
        <h1 className="mb-8 text-2xl font-black text-slate-900">تکمیل خرید</h1>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          {/* Customer Information */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">اطلاعات تماس</h2>
              
              {error && (
                <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    نام و نام خانوادگی (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    placeholder="علی احمدی"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    ایمیل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    placeholder="example@email.com"
                    required
                    dir="ltr"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    اطلاعات اکانت به این ایمیل ارسال می‌شود
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    شماره موبایل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    placeholder="09123456789"
                    required
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">محصولات سفارش</h2>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.gameId.id} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
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
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{item.gameId.title}</div>
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="text-xs text-slate-500">
                          {Object.entries(item.selectedOptions).map(([k, v]) => v).join(' | ')}
                        </div>
                      )}
                      <div className="text-sm text-slate-600">تعداد: {item.quantity}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900">{formatToman(item.priceAtAdd * item.quantity)}</div>
                      <div className="text-xs text-slate-500">تومان</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

            <button
              type="submit"
              disabled={loading || !customerInfo.email || !customerInfo.phone}
              className="mt-6 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال پردازش...' : 'پرداخت و ثبت نهایی'}
            </button>
            
            <p className="mt-4 text-center text-xs text-slate-400">
              با نهایی کردن خرید، قوانین و مقررات GameClub را می‌پذیرید.
            </p>

            <div className="mt-6 rounded-xl bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-emerald-700">
                  <div className="font-bold">پرداخت امن</div>
                  <div className="mt-1">اطلاعات اکانت بلافاصله پس از پرداخت به ایمیل و پنل کاربری شما ارسال می‌شود.</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
