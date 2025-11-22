'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatToman } from '@/lib/format';
import { API_BASE_URL } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';
import { getAuthToken } from '@/lib/auth';

type CouponResult = {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    discount: number;
    stackable: boolean;
  };
  error?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, loading: cartLoading, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('online');

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult['coupon'] | null>(null);

  // Auto-fill user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.data;
          
          if (user) {
            setCustomerInfo(prev => ({
              ...prev,
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || ''
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponResult(null);
      setAppliedCoupon(null);
      return;
    }

    setCouponLoading(true);
    setCouponResult(null);

    try {
      const token = getAuthToken();
      const productIds = cart?.items.map(item => item.gameId.id) || [];

      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          cartTotal: totalPrice,
          productIds
        })
      });

      const data = await response.json();
      
      if (data.success && data.data.valid) {
        setCouponResult(data.data);
        setAppliedCoupon(data.data.coupon);
        setError('');
      } else {
        setCouponResult({
          valid: false,
          error: data.data?.error || 'کد تخفیف معتبر نیست'
        });
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponResult({
        valid: false,
        error: 'خطا در اعتبارسنجی کد تخفیف'
      });
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };


  const removeCoupon = () => {
    setCouponCode('');
    setCouponResult(null);
    setAppliedCoupon(null);
  };

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
      const token = getAuthToken();
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

      // Calculate final amount with discount
      const discountAmount = appliedCoupon?.discount || 0;
      const finalAmount = Math.max(0, totalPrice - discountAmount);

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerInfo,
          items,
          totalAmount: finalAmount,
          couponCode: appliedCoupon?.code,
          discountAmount: discountAmount > 0 ? discountAmount : undefined,
          paymentMethod, // Send payment method if backend supports it, otherwise it's just for UI
          note: customerInfo.note
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
          {/* Left Column: Forms */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Customer Information */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Icon name="user" size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">اطلاعات تماس</h2>
              </div>
              
              {error && (
                <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="علی احمدی"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    شماره موبایل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="09123456789"
                    required
                    dir="ltr"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700">
                    ایمیل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="example@email.com"
                    required
                    dir="ltr"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    اطلاعات اکانت به این ایمیل ارسال می‌شود
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon name="credit-card" size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">روش پرداخت</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                  paymentMethod === 'online' 
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-5 w-5 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900">پرداخت اینترنتی</div>
                    <div className="text-xs text-slate-500">کلیه کارت‌های بانکی عضو شتاب</div>
                  </div>
                </label>

                <label className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                  paymentMethod === 'wallet' 
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-5 w-5 text-emerald-500 focus:ring-emerald-500"
                    disabled
                  />
                  <div className="opacity-50">
                    <div className="font-bold text-slate-900">کیف پول (به زودی)</div>
                    <div className="text-xs text-slate-500">پرداخت سریع با موجودی حساب</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <Icon name="message" size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">توضیحات سفارش (اختیاری)</h2>
              </div>

              <textarea
                value={customerInfo.note}
                onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                placeholder="اگر توضیح خاصی دارید اینجا بنویسید..."
              />
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

          {/* Right Column: Summary */}
          <div className="h-fit space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
              <h2 className="mb-4 text-lg font-bold text-slate-900">خلاصه سفارش</h2>
              
              {/* Coupon Section */}
              <div className="mb-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">کد تخفیف</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (couponCode.trim() && !couponLoading) {
                              validateCoupon(couponCode);
                            }
                          }
                        }}
                        placeholder="کد تخفیف"
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => validateCoupon(couponCode)}
                        disabled={couponLoading || !couponCode.trim()}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {couponLoading ? '...' : 'اعمال'}
                      </button>
                    </div>
                    {couponResult && !couponResult.valid && (
                      <p className="text-xs text-rose-600 mt-1">{couponResult.error}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="check" size={18} className="text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-emerald-700">{appliedCoupon.name}</p>
                        <p className="text-xs text-slate-600 font-mono">{appliedCoupon.code}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                      title="حذف کوپن"
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 border-b border-slate-100 pb-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>قیمت کالاها ({cart.items.length})</span>
                  <span>{formatToman(totalPrice)} تومان</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-semibold">تخفیف ({appliedCoupon.code})</span>
                    <span className="text-emerald-600 font-bold">
                      -{formatToman(appliedCoupon.discount)} تومان
                    </span>
                  </div>
                )}
                {!appliedCoupon && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>تخفیف</span>
                    <span>0 تومان</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between text-lg font-black text-slate-900">
                <span>مبلغ قابل پرداخت</span>
                <span>
                  {formatToman(Math.max(0, totalPrice - (appliedCoupon?.discount || 0)))} تومان
                </span>
              </div>
              
              {appliedCoupon && (
                <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  <span className="font-semibold">🎉 شما {formatToman(appliedCoupon.discount)} تومان تخفیف دریافت کردید!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !customerInfo.email || !customerInfo.phone}
                className="mt-6 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
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
          </div>
        </form>
      </div>
    </div>
  );
}
