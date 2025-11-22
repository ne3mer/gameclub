'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminOrder } from '@/types/admin';
import { API_BASE_URL } from '@/lib/api';
import { PriceAlertModal } from '@/components/alerts/PriceAlertModal';
import { formatToman } from '@/lib/format';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { Icon } from '@/components/icons/Icon';
import { getAuthToken } from '@/lib/auth';
import MyTournamentsSection from '@/components/dashboard/MyTournamentsSection';
import ArenaSettingsSection from '@/components/dashboard/ArenaSettingsSection';
import { QuickTrackWidget } from '@/components/dashboard/QuickTrackWidget';

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
    productType?: string;
  };
  variantId?: string;
  selectedOptions?: Record<string, string>;
  quantity?: number;
  pricePaid?: number;
  warranty?: {
    status: 'active' | 'expired' | 'voided';
    startDate?: string;
    endDate?: string;
    description?: string;
  };
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
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState('');
  const [profileSaveError, setProfileSaveError] = useState('');

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
              productType: item.gameId?.productType,
              variantId: item.variantId,
              selectedOptions: item.selectedOptions,
              quantity: item.quantity ?? 1,
              pricePaid: item.pricePaid ?? 0,
              warranty: item.warranty
            })),
            deliveryInfo: order.deliveryInfo
              ? {
                  message: order.deliveryInfo.message,
                  credentials: order.deliveryInfo.credentials,
                  deliveredAt: order.deliveryInfo.deliveredAt
                }
              : undefined,
            customerAcknowledgement: order.customerAcknowledgement
              ? {
                  acknowledged: order.customerAcknowledgement.acknowledged ?? false,
                  acknowledgedAt: order.customerAcknowledgement.acknowledgedAt
                }
              : undefined
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
    // Validate telegram field
    if (field === 'telegram' && value && value.startsWith('@')) {
      // Don't prevent, but will show warning in UI
    }
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setProfileSaveError('');
    setProfileSaveSuccess('');
  };

  const handleProfileSave = async () => {
    const authToken = getAuthToken();
    if (!authToken) {
      setProfileSaveError('لطفاً ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    setProfileSaving(true);
    setProfileSaveError('');
    setProfileSaveSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileForm.name || undefined,
          phone: profileForm.phone || undefined,
          telegram: profileForm.telegram || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'خطا در به‌روزرسانی اطلاعات');
      }

      setProfileSaveSuccess('اطلاعات شما با موفقیت به‌روزرسانی شد');
      
      // Update local storage
      const storedUser = localStorage.getItem('gc_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const updatedUser = {
            ...user,
            name: data.data.name || user.name,
            phone: data.data.phone || user.phone,
            telegram: data.data.telegram || user.telegram
          };
          localStorage.setItem('gc_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('gc-auth-change'));
        } catch (err) {
          console.error('Failed to update local storage:', err);
        }
      }

      // Update profile state
      syncAuthState();

      setTimeout(() => {
        setProfileSaveSuccess('');
      }, 3000);
    } catch (error) {
      setProfileSaveError(error instanceof Error ? error.message : 'خطا در به‌روزرسانی اطلاعات');
      setTimeout(() => {
        setProfileSaveError('');
      }, 5000);
    } finally {
      setProfileSaving(false);
    }
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
      <section className="relative overflow-hidden rounded-[36px] border border-white bg-white p-8 text-slate-900 shadow-[0_25px_100px_rgba(15,23,42,0.12)]">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-emerald-100 blur-3xl" />
          <div className="absolute left-10 -bottom-10 h-32 w-32 rounded-full bg-sky-100 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600">داشبورد مشتری GameClub</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{profile.name || 'کاربر GameClub'}</h1>
            <p className="text-sm text-slate-500">{profile.email}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                {profile.phone || 'شماره ثبت نشده'}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                سطح: {summary.totalSpent > 20_000_000 ? 'Titanium' : 'Silver'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right md:text-left">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm shadow-inner">
              <p className="text-xs text-slate-500">آخرین سفارش</p>
              <p className="text-lg font-black text-slate-900">{summary.lastOrderDate}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-100 bg-white text-xl font-black text-slate-900 shadow-sm">
              {heroInitials}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="تعداد سفارش‌ها" value={summary.totalOrders} icon="package" />
        <StatCard label="پرداخت‌های موفق" value={summary.totalPaid} icon="check" />
        <StatCard label="جمع خرید" value={`${summary.totalSpent.toLocaleString('fa-IR')} تومان`} icon="dollar" />
        <StatCard label="برنامه وفاداری" value={summary.totalSpent > 20_000_000 ? 'Titanium Club' : summary.totalSpent > 10_000_000 ? 'Gold Club' : 'Silver Club'} icon="award" />
      </section>

      {/* Notifications Section */}
      <section>
        <NotificationCenter />
      </section>

      {/* Quick Track Section */}
      <section id="track">
        <header className="mb-6">
          <p className="text-xs text-slate-500">پیگیری خودکار</p>
          <h2 className="text-lg font-bold text-slate-900">پیگیری سفارشات</h2>
        </header>
        <QuickTrackWidget />
      </section>

      {/* My Tournaments Section */}
      <section>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">آرنا</p>
            <h2 className="text-lg font-bold text-slate-900">تورنمنت‌های من</h2>
          </div>
          <Link
            href="/arena"
            className="text-xs font-bold text-purple-600 hover:text-purple-700"
          >
            مشاهده همه تورنمنت‌ها
          </Link>
        </header>
        <MyTournamentsSection />
      </section>


      {/* Arena Settings Section */}
      <section>
        <header className="mb-6">
          <p className="text-xs text-slate-500">تنظیمات آرنا</p>
          <h2 className="text-lg font-bold text-slate-900">پروفایل گیمینگ و مالی</h2>
        </header>
        <ArenaSettingsSection />
      </section>

      {/* My Games Section (Digital) */}
      <section>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">کتابخانه من</p>
            <h2 className="text-lg font-bold text-slate-900">بازی‌های دیجیتال</h2>
          </div>
        </header>
        
        {ordersLoading ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 py-10 text-center text-sm text-slate-500">
            در حال بارگذاری بازی‌ها...
          </div>
        ) : (
          <DigitalLibrarySection orders={orders} />
        )}
      </section>

      {/* Physical Orders Section */}
      <section>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">سفارش‌های فیزیکی</p>
            <h2 className="text-lg font-bold text-slate-900">پیگیری مرسولات</h2>
          </div>
        </header>
        
        {ordersLoading ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 py-10 text-center text-sm text-slate-500">
            در حال بارگذاری سفارش‌ها...
          </div>
        ) : (
          <PhysicalOrdersSection orders={orders} />
        )}
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
                      className="flex-1 rounded-2xl border border-[#d1d1d6] bg-white px-4 py-2 text-center text-slate-700 hover:border-[#0a84ff]/40 hover:text-[#0a84ff]"
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

      {/* Game Request Card */}
      <section>
        <Link 
          href="/account/requests"
          className="group block overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-500 to-indigo-600 p-8 shadow-2xl shadow-purple-500/30 transition hover:scale-[1.02] hover:shadow-purple-500/50"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wide text-white">
                  ویژه
                </span>
              </div>
              <h3 className="mb-2 text-2xl font-black text-white">
                بازی مورد نظرت رو پیدا نکردی؟
              </h3>
              <p className="mb-4 text-white/90">
                درخواست بده و ما اضافه‌ش می‌کنیم! فرم خلاقانه با انتخابگر پلتفرم و منطقه
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <span>ثبت درخواست</span>
                <Icon name="arrow-left" size={16} className="transition-transform group-hover:-translate-x-1" />
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm text-white">
              <Icon name="game" size={32} />
            </div>
          </div>
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProfileFormCard 
          profileForm={profileForm} 
          onChange={handleProfileChange}
          onSave={handleProfileSave}
          saving={profileSaving}
          success={profileSaveSuccess}
          error={profileSaveError}
        />
        <AlertsCard />
      </section>
    </div>
  );
}

const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon?: string }) => (
  <article className="group relative overflow-hidden rounded-3xl border border-[#e5e5ea] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#0a84ff]/30">
    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#eef1f7] blur-2xl transition-all group-hover:bg-[#dfe5f1]"></div>
    <div className="relative">
      {icon && (
        <div className="mb-2 text-slate-600">
          <Icon name={icon as any} size={24} strokeWidth={2} />
        </div>
      )}
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  </article>
);

const LoyaltyColumn = ({ summary }: { summary: { totalSpent: number; totalOrders: number } }) => {
  const tier = summary.totalSpent > 20_000_000 ? 'Titanium' : summary.totalSpent > 10_000_000 ? 'Gold' : 'Starter';
  const progress = Math.min(100, Math.round((summary.totalSpent / 20_000_000) * 100));

  return (
    <aside className="space-y-4">
      <div className="rounded-3xl border border-[#e5e5ea] bg-gradient-to-br from-[#111113] to-[#1d1d1f] p-6 text-white shadow-xl">
        <p className="text-xs uppercase tracking-widest text-white/70">GameClub Loyalty</p>
        <h3 className="mt-2 text-2xl font-black">{tier} Member</h3>
        <p className="mt-2 text-sm text-white/70">
          با خرید بیشتر، مزایای اختصاصی مثل پشتیبانی VIP و تخفیف Safe Account دریافت کنید.
        </p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/60">
            <span>پیشرفت</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/20">
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
  onChange,
  onSave,
  saving,
  success,
  error
}: {
  profileForm: { name: string; email: string; phone: string; telegram: string };
  onChange: (field: keyof typeof profileForm, value: string) => void;
  onSave: () => void;
  saving: boolean;
  success: string;
  error: string;
}) => (
  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
    <h3 className="text-lg font-bold text-slate-900">اطلاعات تماس</h3>
    <p className="text-xs text-slate-500">ویرایش اطلاعات برای دریافت رسید و پشتیبانی سریع‌تر</p>
    
    {success && (
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
        <Icon name="check" size={20} className="text-emerald-600 flex-shrink-0" />
        <p className="text-sm text-emerald-700 font-semibold">{success}</p>
      </div>
    )}

    {error && (
      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-center gap-3">
        <Icon name="alert" size={20} className="text-rose-600 flex-shrink-0" />
        <p className="text-sm text-rose-700 font-semibold">{error}</p>
      </div>
    )}

    <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
      <label>
        نام کامل
        <input
          value={profileForm.name}
          onChange={(event) => onChange('name', event.target.value)}
          disabled={saving}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </label>
      <label>
        ایمیل
        <input
          value={profileForm.email}
          disabled
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed"
          title="ایمیل قابل تغییر نیست"
        />
        <p className="text-xs text-slate-400 mt-1">ایمیل قابل تغییر نیست</p>
      </label>
      <label>
        شماره موبایل
        <input
          type="tel"
          value={profileForm.phone}
          onChange={(event) => onChange('phone', event.target.value)}
          disabled={saving}
          placeholder="09123456789"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </label>
      <label>
        آیدی تلگرام
        <input
          type="text"
          value={profileForm.telegram}
          onChange={(event) => onChange('telegram', event.target.value)}
          disabled={saving}
          placeholder="24273100 (Chat ID عددی)"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="mt-1 space-y-1">
          {profileForm.telegram && profileForm.telegram.startsWith('@') && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-2">
              <p className="text-xs font-semibold text-amber-800">
                ⚠️ هشدار: استفاده از username کار نمی‌کند!
              </p>
              <p className="text-xs text-amber-700 mt-1">
                لطفاً Chat ID عددی خود را وارد کنید (مثلاً: 24273100)
              </p>
            </div>
          )}
          <p className="text-xs text-slate-400">
            برای دریافت اعلان‌های تلگرام - <strong>فقط Chat ID عددی</strong>
          </p>
          <p className="text-xs text-slate-500">
            برای دریافت Chat ID: به <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-semibold">@userinfobot</a> یا <a href="https://t.me/getidsbot" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-semibold">@getidsbot</a> پیام بدهید
          </p>
          <p className="text-xs text-slate-400">
            همچنین باید ابتدا با ربات ما گفتگو را شروع کنید
          </p>
        </div>
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
    <button
      onClick={onSave}
      disabled={saving}
      className="mt-4 w-full rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {saving ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          در حال ذخیره...
        </>
      ) : (
        <>
          <Icon name="save" size={16} />
      ذخیره تغییرات
        </>
      )}
    </button>
  </div>
);

const AlertsCard = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<{ id: string; title: string; price: number } | null>(null);
  const [editingAlert, setEditingAlert] = useState<any>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const token = localStorage.getItem('gc_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/price-alerts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(Array.isArray(data?.data) ? data.data : []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('آیا از حذف این هشدار اطمینان دارید؟')) return;

    const token = localStorage.getItem('gc_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/price-alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (err) {
      alert('خطا در حذف هشدار');
    }
  };

  const handleEdit = (alert: any) => {
    const game = alert.gameId || {};
    setEditingAlert({
      id: alert.id || alert._id,
      targetPrice: alert.targetPrice,
      channel: alert.channel,
      destination: alert.destination
    });
    setSelectedGame({
      id: game.id || game._id,
      title: game.title || 'بازی',
      price: game.basePrice || 0
    });
    setShowModal(true);
  };

  return (
    <>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">اعلان‌های قیمت</h3>
            <p className="text-xs text-slate-500">خبر دار شوید تا اولین نفر خرید کنید</p>
          </div>
          <button
            onClick={() => {
              setEditingAlert(null);
              setSelectedGame(null);
              setShowModal(true);
            }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition"
          >
            + هشدار جدید
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-500"></div>
              <p className="text-xs text-slate-500 mt-2">در حال بارگذاری...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              <p>هنوز هشداری ثبت نشده است</p>
              <p className="text-xs text-slate-400 mt-1">برای دریافت اعلان کاهش قیمت، هشدار جدید ایجاد کنید</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const game = alert.gameId || {};
              const gameTitle = game.title || 'بازی ناشناس';
              const currentPrice = game.basePrice || 0;
              
              return (
                <div
                  key={alert.id || alert._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{gameTitle}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Icon name={alert.channel === 'email' ? 'mail' : 'message'} size={14} />
                        {alert.channel === 'email' ? 'ایمیل' : 'تلگرام'}
                      </span>
                      <span>{alert.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {formatToman(alert.targetPrice)}
                    </span>
                    <button
                      onClick={() => handleEdit(alert)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white transition"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(alert.id || alert._id)}
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <PriceAlertModal
          gameId={selectedGame?.id}
          gameTitle={selectedGame?.title}
          currentPrice={selectedGame?.price}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingAlert(null);
            setSelectedGame(null);
          }}
          onSuccess={() => {
            fetchAlerts();
            setShowModal(false);
            setEditingAlert(null);
            setSelectedGame(null);
          }}
          existingAlert={editingAlert}
        />
      )}
    </>
  );
};

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

const DigitalLibrarySection = ({ orders }: { orders: AdminOrder[] }) => {
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  const games = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === 'paid')
      .flatMap((o) =>
        o.items
          .filter((item) => !item.productType || item.productType === 'digital_game' || item.productType === 'digital_content')
          .map((item) => ({
            ...item,
            purchaseDate: o.createdAt,
            orderId: o.id,
            orderNumber: o.orderNumber,
            deliveryInfo: o.deliveryInfo
          }))
      )
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [orders]);

  const handleGameClick = (game: any) => {
    setSelectedGame(game);
    setShowMessagesModal(true);
  };

  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 py-10 text-center text-sm text-slate-500">
        هنوز بازی دیجیتالی خریداری نکرده‌اید.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game, idx) => (
          <GameWarrantyCard 
            key={`${game.orderId}-${idx}`} 
            game={game}
            onClick={() => handleGameClick(game)}
          />
        ))}
      </div>

      {showMessagesModal && selectedGame && (
        <GameMessagesModal
          game={selectedGame}
          onClose={() => {
            setShowMessagesModal(false);
            setSelectedGame(null);
          }}
        />
      )}
    </>
  );
};

const PhysicalOrdersSection = ({ orders }: { orders: AdminOrder[] }) => {
  const physicalItems = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === 'paid')
      .flatMap((o) =>
        o.items
          .filter((item) => item.productType && item.productType !== 'digital_game' && item.productType !== 'digital_content')
          .map((item) => ({
            ...item,
            purchaseDate: o.createdAt,
            orderId: o.id,
            orderNumber: o.orderNumber,
            fulfillmentStatus: o.fulfillmentStatus,
            deliveryInfo: o.deliveryInfo
          }))
      )
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [orders]);

  if (physicalItems.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 py-10 text-center text-sm text-slate-500">
        هنوز محصول فیزیکی خریداری نکرده‌اید.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {physicalItems.map((item, idx) => (
        <div key={`${item.orderId}-${idx}`} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Icon name="package" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 line-clamp-1">{item.gameTitle}</h3>
                <p className="text-xs text-slate-500">سفارش {item.orderNumber}</p>
              </div>
            </div>
            <span className={statusChip('fulfillment', item.fulfillmentStatus)}>
              {fulfillmentLabels[item.fulfillmentStatus] ?? item.fulfillmentStatus}
            </span>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>تعداد:</span>
              <span className="font-bold">{item.quantity} عدد</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>تاریخ خرید:</span>
              <span className="font-bold">{new Date(item.purchaseDate).toLocaleDateString('fa-IR')}</span>
            </div>
            {item.deliveryInfo?.message && (
              <div className="mt-2 border-t border-slate-200 pt-2">
                <p className="font-bold text-slate-700 mb-1">وضعیت ارسال:</p>
                <p className="text-slate-600 leading-relaxed">{item.deliveryInfo.message}</p>
              </div>
            )}
          </div>
          
          <Link 
            href={`/orders/${item.orderId}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            <span>مشاهده جزئیات</span>
            <Icon name="arrow-left" size={14} />
          </Link>
        </div>
      ))}
    </div>
  );
};

const GameWarrantyCard = ({ game, onClick }: { game: any; onClick: () => void }) => {
  const warranty = game.warranty;
  const hasWarranty = warranty?.status === 'active' && warranty.endDate;

  // Calculate remaining time
  const calculateTimeLeft = () => {
    if (!hasWarranty) return { days: 0, percent: 0 };
    const start = new Date(warranty.startDate || game.purchaseDate).getTime();
    const end = new Date(warranty.endDate).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const remaining = end - now;
    const percent = Math.max(0, Math.min(100, (remaining / total) * 100));
    const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    return { days, percent };
  };

  const { days, percent } = calculateTimeLeft();
  const isExpiringSoon = days > 0 && days <= 30;

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 cursor-pointer text-left"
    >
      {/* Content */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-500">
          <Icon name="game" size={24} />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="truncate font-bold text-slate-900" title={game.gameTitle}>
            {game.gameTitle}
          </h3>
          <p className="text-xs text-slate-500">
            {new Date(game.purchaseDate).toLocaleDateString('fa-IR')}
          </p>
        </div>
      </div>

      {/* Warranty Section */}
      <div className="mt-4">
        {hasWarranty && days > 0 ? (
          <div
            className={`relative overflow-hidden rounded-2xl p-3 transition-colors ${
              isExpiringSoon ? 'bg-amber-50' : 'bg-emerald-50'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className={`text-xs font-bold ${
                  isExpiringSoon ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {isExpiringSoon ? '⚠️ رو به اتمام' : '🛡️ گارانتی فعال'}
              </span>
              <span
                className={`text-xs font-bold ${
                  isExpiringSoon ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {days} روز
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/50">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            {/* Shine Effect */}
            <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-white/20 blur-xl transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-3 text-center text-xs text-slate-400">
            {warranty?.status === 'expired'
              ? 'گارانتی به اتمام رسیده'
              : warranty?.status === 'voided'
              ? 'گارانتی باطل شده'
              : 'بدون گارانتی فعال'}
          </div>
        )}
      </div>
    </button>
  );
};

const GameMessagesModal = ({ game, onClose }: { game: any; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 to-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Icon name="message" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{game.gameTitle}</h2>
                  <p className="text-xs text-slate-500">پیام‌های ادمین</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600">
                  سفارش: {game.orderNumber}
                </span>
                <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600">
                  {new Date(game.purchaseDate).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 transition hover:bg-slate-100"
            >
              <Icon name="x" size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {game.deliveryInfo?.message || game.deliveryInfo?.credentials ? (
            <div className="space-y-4">
              {/* Delivery Message */}
              {game.deliveryInfo.message && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon name="mail" size={16} className="text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-900">پیام تحویل</p>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-emerald-800">
                    {game.deliveryInfo.message}
                  </p>
                  {game.deliveryInfo.deliveredAt && (
                    <p className="mt-3 text-xs text-emerald-700">
                      📅 ارسال شده در: {new Date(game.deliveryInfo.deliveredAt).toLocaleString('fa-IR')}
                    </p>
                  )}
                </div>
              )}

              {/* Credentials */}
              {game.deliveryInfo.credentials && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon name="lock" size={16} className="text-blue-600" />
                    <p className="text-sm font-bold text-blue-900">اطلاعات اکانت</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3 font-mono text-sm text-slate-700">
                    {game.deliveryInfo.credentials}
                  </div>
                  <p className="mt-2 text-xs text-blue-700">
                    💡 این اطلاعات را در جای امنی ذخیره کنید
                  </p>
                </div>
              )}

              {/* Warranty Info if exists */}
              {game.warranty?.status === 'active' && game.warranty.description && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon name="shield" size={16} className="text-amber-600" />
                    <p className="text-sm font-bold text-amber-900">شرایط گارانتی</p>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-amber-800">
                    {game.warranty.description}
                  </p>
                  {game.warranty.endDate && (
                    <p className="mt-3 text-xs text-amber-700">
                      ⏰ اعتبار تا: {new Date(game.warranty.endDate).toLocaleDateString('fa-IR')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Icon name="info" size={32} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">هنوز پیامی ارسال نشده</p>
              <p className="mt-1 text-xs text-slate-500">
                پس از تحویل بازی، اطلاعات اکانت و پیام‌های ادمین اینجا نمایش داده می‌شود
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
