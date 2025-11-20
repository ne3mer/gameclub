'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { priceAlerts } from '@/data/catalog';
import type { AdminOrder } from '@/types/admin';
import { API_BASE_URL } from '@/lib/api';

type ProfileState = {
  name?: string;
  email?: string;
  phone?: string;
  telegram?: string;
};

type RawOrderItem = {
  id?: string;
  _id?: string;
  gameId?: {
    title?: string;
    name?: string;
  };
  variantId?: string;
  selectedOptions?: Record<string, string>;
  quantity?: number;
  pricePaid?: number;
};

type RawOrder = {
  id?: string;
  _id?: string;
  orderNumber?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  paymentStatus?: AdminOrder['paymentStatus'];
  fulfillmentStatus?: AdminOrder['fulfillmentStatus'];
  totalAmount?: number;
  paymentReference?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: RawOrderItem[];
  deliveryInfo?: {
    message?: string;
    credentials?: string;
    deliveredAt?: string;
  };
  customerAcknowledgement?: {
    acknowledged?: boolean;
    acknowledgedAt?: string;
  };
};

const paymentStatusLabels: Record<string, string> = {
  paid: 'پرداخت شده',
  pending: 'در انتظار پرداخت',
  failed: 'ناموفق'
};

const fulfillmentLabels: Record<string, string> = {
  pending: 'در انتظار تحویل',
  assigned: 'تحویل به تیم فنی',
  delivered: 'تحویل شده',
  refunded: 'مرجوع شده'
};

const statusChip = (type: 'payment' | 'fulfillment', status: string) => {
  const base = 'rounded-full px-3 py-1 text-xs font-semibold';
  if (type === 'payment') {
    if (status === 'paid') return `${base} bg-emerald-50 text-emerald-600`;
    if (status === 'failed') return `${base} bg-rose-50 text-rose-600`;
    return `${base} bg-amber-50 text-amber-600`;
  }
  if (status === 'delivered') return `${base} bg-emerald-50 text-emerald-600`;
  if (status === 'assigned') return `${base} bg-blue-50 text-blue-600`;
  if (status === 'refunded') return `${base} bg-rose-50 text-rose-600`;
  return `${base} bg-slate-100 text-slate-500`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '---';
  try {
    return new Date(value).toLocaleString('fa-IR');
  } catch {
    return value;
  }
};

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfileState>({});
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    telegram: ''
  });
  const [ackLoadingId, setAckLoadingId] = useState<string | null>(null);

  const readAuthFromStorage = useCallback(() => {
    if (typeof window === 'undefined') {
      return { profile: {}, token: null };
    }
    const storedToken = localStorage.getItem('gc_token');
    const storedProfile = localStorage.getItem('gc_user');
    if (storedToken && storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        return {
          token: storedToken,
          profile: {
            name: parsed?.name ?? parsed?.fullName ?? '',
            email: parsed?.email ?? '',
            phone: parsed?.phone ?? '',
            telegram: parsed?.telegram ?? ''
          }
        };
      } catch {
        return { profile: {}, token: null };
      }
    }
    return { profile: {}, token: null };
  }, []);

  const syncAuthState = useCallback(() => {
    const snapshot = readAuthFromStorage();
    setProfile(snapshot.profile);
    setProfileForm({
      name: snapshot.profile.name ?? '',
      email: snapshot.profile.email ?? '',
      phone: snapshot.profile.phone ?? '',
      telegram: snapshot.profile.telegram ?? ''
    });
    setToken(snapshot.token);
    setIsAuthenticated(snapshot.token ? true : false);
  }, [readAuthFromStorage]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    syncAuthState();
    const handleAuth = () => syncAuthState();
    window.addEventListener('gc-auth-change', handleAuth);
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('gc-auth-change', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, [syncAuthState]);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      return;
    }
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('خطا در دریافت سفارشات');
        }
        const payload = await response.json();
        const rawOrders: RawOrder[] = Array.isArray(payload?.data) ? (payload.data as RawOrder[]) : [];
        const normalized: AdminOrder[] = rawOrders.map((order, index) => {
          const safeCustomer = {
            name: order.customerInfo?.name ?? profile.name,
            email: order.customerInfo?.email ?? profile.email ?? '',
            phone: order.customerInfo?.phone ?? profile.phone ?? ''
          };
          return {
            id: order.id ?? order._id ?? `order-${index}`,
            orderNumber: order.orderNumber ?? order.id ?? '---',
            customerInfo: safeCustomer,
            paymentStatus: order.paymentStatus ?? 'pending',
            fulfillmentStatus: order.fulfillmentStatus ?? 'pending',
            totalAmount: order.totalAmount ?? 0,
            paymentReference: order.paymentReference,
            createdAt: order.createdAt ?? new Date().toISOString(),
            updatedAt: order.updatedAt ?? order.createdAt ?? new Date().toISOString(),
            items: (order.items ?? []).map((item, idx) => ({
              id: item.id ?? item._id ?? `${order.id ?? index}-${idx}`,
              gameTitle: item.gameId?.title ?? item.gameId?.name ?? 'بازی',
              variantId: item.variantId,
              selectedOptions: item.selectedOptions,
              quantity: item.quantity ?? 1,
              pricePaid: item.pricePaid ?? 0
            })),
            deliveryInfo: order.deliveryInfo
              ? {
                  message: order.deliveryInfo.message,
                  credentials: order.deliveryInfo.credentials,
                  deliveredAt: order.deliveryInfo.deliveredAt
                }
              : undefined,
            customerAcknowledgement: order.customerAcknowledgement
          };
        });
        setOrders(normalized);
      } catch (error) {
        console.warn('خطا در دریافت سفارشات کاربر', error);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [token, profile]);

  const summary = useMemo(() => {
    if (!orders.length) {
      return {
        totalOrders: 0,
        totalPaid: 0,
        totalSpent: 0,
        lastOrderDate: '---'
      };
    }
    const totalOrders = orders.length;
    const paidOrders = orders.filter((order) => order.paymentStatus === 'paid');
    const totalPaid = paidOrders.length;
    const totalSpent = paidOrders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
    const lastOrderDate = paidOrders[0]?.createdAt ?? orders[0]?.createdAt ?? '---';
    return {
      totalOrders,
      totalPaid,
      totalSpent,
      lastOrderDate: formatDateTime(lastOrderDate)
    };
  }, [orders]);

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const heroInitials = useMemo(() => {
    const base = profile.name ?? profile.email ?? '';
    if (!base.trim()) return 'GC';
    return base
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }, [profile]);

  const handleAcknowledge = async (orderId: string) => {
    if (!token) return;
    setAckLoadingId(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/ack`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ acknowledged: true })
      });
      if (!response.ok) {
        throw new Error('تایید سفارش ممکن نیست');
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                customerAcknowledgement: {
                  acknowledged: true,
                  acknowledgedAt: new Date().toISOString()
                }
              }
            : order
        )
      );
    } catch (error) {
      console.warn(error);
    } finally {
      setAckLoadingId(null);
    }
  };

  if (!hydrated || isAuthenticated === null) {
    return (
      <div className="bg-slate-50 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          در حال بررسی وضعیت حساب کاربری...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AccountAuthGate />;
  }

  const highlightOrders = orders.slice(0, 4);

  return (
    <div className="space-y-8 bg-slate-50 px-4 py-10 md:px-8">
      <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-l from-slate-900 via-slate-800 to-slate-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute left-10 -bottom-10 h-32 w-32 rounded-full bg-sky-400 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-emerald-300">داشبورد مشتری GameClub</p>
            <h1 className="mt-2 text-3xl font-black">{profile.name || 'کاربر GameClub'}</h1>
            <p className="text-sm text-white/70">{profile.email}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/80">
              <span className="rounded-full border border-white/30 px-3 py-1">
                {profile.phone || 'شماره ثبت نشده'}
              </span>
              <span className="rounded-full border border-white/30 px-3 py-1">
                سطح: {summary.totalSpent > 20_000_000 ? 'Titanium' : 'Silver'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right md:text-left">
            <div className="rounded-3xl border border-white/20 bg-white/10 px-6 py-4 text-sm">
              <p className="text-xs text-white/70">آخرین سفارش</p>
              <p className="text-lg font-black">{summary.lastOrderDate}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/30 bg-white/10 text-xl font-black">
              {heroInitials}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="تعداد سفارش‌ها" value={summary.totalOrders} />
        <StatCard label="پرداخت‌های موفق" value={summary.totalPaid} />
        <StatCard label="جمع خرید" value={`${summary.totalSpent.toLocaleString('fa-IR')} تومان`} />
        <StatCard label="برنامه وفاداری" value={summary.totalSpent > 20_000_000 ? 'Titanium Club' : 'Silver Club'} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">تایم‌لاین سفارشات</p>
              <h2 className="text-lg font-bold text-slate-900">پیگیری زنده</h2>
            </div>
            <Link
              href="/orders"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              مشاهده همه
            </Link>
          </header>
          {ordersLoading ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 py-10 text-center text-sm text-slate-500">
              در حال دریافت سفارشات...
            </div>
          ) : highlightOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 py-10 text-center text-sm text-slate-500">
              هنوز سفارشی ثبت نکرده‌اید.
            </div>
          ) : (
            <div className="space-y-4">
              {highlightOrders.map((order) => (
                <div
                  key={order.id}
                  className="relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">سفارش {order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <p className="text-left text-sm font-bold text-slate-900">
                      {order.totalAmount.toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className={statusChip('payment', order.paymentStatus)}>
                      {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                    <span className={statusChip('fulfillment', order.fulfillmentStatus)}>
                      {fulfillmentLabels[order.fulfillmentStatus] ?? order.fulfillmentStatus}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.gameTitle}</span>
                        <span>
                          {item.quantity} × {item.pricePaid.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.deliveryInfo?.message && (
                    <div className="mt-4 space-y-1 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-900">
                      <p className="text-sm font-bold text-emerald-800">پیام تحویل</p>
                      <p className="whitespace-pre-line">{order.deliveryInfo.message}</p>
                      {order.deliveryInfo.credentials && (
                        <p className="rounded-xl bg-white/80 p-2 font-mono text-[11px] text-slate-700">
                          {order.deliveryInfo.credentials}
                        </p>
                      )}
                      <p className="text-[11px] text-emerald-700">
                        ارسال شده در {formatDateTime(order.deliveryInfo.deliveredAt)}
                      </p>
                      {order.customerAcknowledgement?.acknowledged ? (
                        <p className="text-[11px] text-emerald-700">
                          تایید شده در {formatDateTime(order.customerAcknowledgement.acknowledgedAt)}
                        </p>
                      ) : (
                        <div className="pt-2">
                          <button
                            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-600"
                            disabled={ackLoadingId === order.id}
                            onClick={() => handleAcknowledge(order.id)}
                          >
                            {ackLoadingId === order.id ? 'در حال ارسال...' : 'تایید کردم'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-center text-slate-600 hover:bg-slate-50"
                    >
                      مدیریت سفارش
                    </Link>
                    <a
                      href={`https://t.me/GameClubSupportBot?start=order-${order.orderNumber ?? order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-emerald-600 hover:bg-emerald-100"
                    >
                      گفتگو با پشتیبانی
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <LoyaltyColumn summary={summary} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProfileFormCard profileForm={profileForm} onChange={handleProfileChange} />
        <AlertsCard />
      </section>
    </div>
  );
}

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
  </article>
);

const LoyaltyColumn = ({ summary }: { summary: { totalSpent: number; totalOrders: number } }) => {
  const tier = summary.totalSpent > 20_000_000 ? 'Titanium' : summary.totalSpent > 10_000_000 ? 'Gold' : 'Starter';
  const progress = Math.min(100, Math.round((summary.totalSpent / 20_000_000) * 100));

  return (
    <aside className="space-y-4">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-widest text-emerald-100">GameClub Loyalty</p>
        <h3 className="mt-2 text-2xl font-black">{tier} Member</h3>
        <p className="mt-2 text-sm text-emerald-100">
          با خرید بیشتر، مزایای اختصاصی مثل پشتیبانی VIP و تخفیف Safe Account دریافت کنید.
        </p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-emerald-50">
            <span>پیشرفت</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-emerald-900/40">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">گزارش سریع</h3>
        <ul className="mt-3 space-y-2 text-xs">
          <li className="flex justify-between">
            <span>کل سفارش‌ها</span>
            <span>{summary.totalOrders}</span>
          </li>
          <li className="flex justify-between">
            <span>مسیر تا سطح بعد</span>
            <span>{(20_000_000 - summary.totalSpent).toLocaleString('fa-IR')} تومان</span>
          </li>
          <li className="flex justify-between">
            <span>تخفیف Safe Account</span>
            <span>{summary.totalSpent > 10_000_000 ? '۱۰٪' : '۵٪'}</span>
          </li>
        </ul>
      </div>
    </aside>
  );
};

const ProfileFormCard = ({
  profileForm,
  onChange
}: {
  profileForm: { name: string; email: string; phone: string; telegram: string };
  onChange: (field: keyof typeof profileForm, value: string) => void;
}) => (
  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
    <h3 className="text-lg font-bold text-slate-900">اطلاعات تماس</h3>
    <p className="text-xs text-slate-500">ویرایش اطلاعات برای دریافت رسید و پشتیبانی سریع‌تر</p>
    <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
      <label>
        نام کامل
        <input
          value={profileForm.name}
          onChange={(event) => onChange('name', event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
      </label>
      <label>
        ایمیل
        <input
          value={profileForm.email}
          onChange={(event) => onChange('email', event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
      </label>
      <label>
        شماره موبایل
        <input
          value={profileForm.phone}
          onChange={(event) => onChange('phone', event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
      </label>
      <label>
        آیدی تلگرام
        <input
          value={profileForm.telegram}
          onChange={(event) => onChange('telegram', event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
      </label>
    </div>
    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
      <span className="rounded-2xl border border-dashed border-emerald-300 px-3 py-1">
        تایید دومرحله‌ای پیشنهاد شده
      </span>
      <span className="rounded-2xl border border-dashed border-emerald-300 px-3 py-1">
        کارت هدیه ۵۰ هزار تومانی بعد از تکمیل پروفایل
      </span>
    </div>
    <button className="mt-4 w-full rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white">
      ذخیره تغییرات
    </button>
  </div>
);

const AlertsCard = () => (
  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold text-slate-900">اعلان‌های قیمت</h3>
        <p className="text-xs text-slate-500">خبر دار شوید تا اولین نفر خرید کنید</p>
      </div>
      <button className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">
        + هشدار جدید
      </button>
    </div>
    <div className="mt-4 space-y-3">
      {priceAlerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600"
        >
          <div>
            <p className="font-semibold text-slate-900">{alert.game}</p>
            <p className="text-xs text-slate-500">{alert.channel}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {alert.target.toLocaleString('fa-IR')}
            </span>
            <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
              لغو
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AccountAuthGate = () => (
  <div className="bg-slate-50 px-4 py-10 md:px-8">
    <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-sm">
      <p className="text-sm text-emerald-600">نیاز به ورود</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900">برای مشاهده حساب ابتدا وارد شوید</h1>
      <p className="mt-3 text-sm text-slate-500">
        خریدهای انجام شده، اعلان‌های قیمت و اطلاعات Safe Account فقط برای کاربران تایید شده نمایش داده می‌شود.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ورود به حساب
        </Link>
        <Link
          href="/register"
          className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
        >
          ساخت حساب جدید
        </Link>
      </div>
    </div>
  </div>
);
