'use client';

import { useEffect, useState } from 'react';
import { dashboardData } from '@/data/catalog';
import { formatToman } from '@/lib/format';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import type { AdminOrder } from '@/types/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ordersToday: dashboardData.ordersToday,
    revenueToday: dashboardData.revenueToday,
    newUsers: dashboardData.newUsers,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/games`);
            const json = await res.json();
            setStats(prev => ({ ...prev, totalProducts: json.data?.length || 0 }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    const fetchRecentOrders = async () => {
      if (!ADMIN_API_KEY) {
        setOrdersLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/admin?limit=5`, {
          headers: adminHeaders()
        });
        if (!response.ok) {
          throw new Error('خطا در دریافت سفارشات');
        }
        const payload = await response.json();
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const normalized: AdminOrder[] = data.map((order: any) => ({
          id: order.id ?? order._id,
          orderNumber: order.orderNumber ?? order.id ?? '---',
          customerInfo: order.customerInfo ?? { email: '---', phone: '---' },
          paymentStatus: order.paymentStatus ?? 'pending',
          fulfillmentStatus: order.fulfillmentStatus ?? 'pending',
          totalAmount: order.totalAmount ?? 0,
          paymentReference: order.paymentReference,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: (order.items ?? []).map((item: any, index: number) => ({
            id: item.id ?? item._id ?? `${order.id}-${index}`,
            gameTitle: item.gameId?.title ?? item.gameId?.name ?? 'بازی',
            variantId: item.variantId,
            selectedOptions: item.selectedOptions,
            quantity: item.quantity ?? 1,
            pricePaid: item.pricePaid ?? 0
          }))
        }));
        setRecentOrders(normalized);
      } catch (error) {
        console.warn('خطا در دریافت سفارشات داشبورد', error);
        setRecentOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchStats();
    fetchRecentOrders();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900">داشبورد</h1>
        <p className="text-sm text-slate-500">خوش آمدید، ادمین عزیز</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="سفارش امروز" value={stats.ordersToday} />
          <StatCard label="درآمد امروز" value={formatToman(stats.revenueToday)} />
          <StatCard label="کاربر جدید" value={stats.newUsers} />
          <StatCard label="تعداد محصولات" value={stats.totalProducts} loading={loading} />
      </section>
      
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">آخرین سفارشات</h2>
            <a
              href="/admin/orders"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              مشاهده همه
            </a>
          </div>
          {ordersLoading ? (
            <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              در حال دریافت سفارشات...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              سفارشی یافت نشد یا کلید ادمین تنظیم نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{order.customerInfo.name || order.customerInfo.email}</p>
                    <p className="text-xs text-slate-500">{order.orderNumber}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">{order.totalAmount.toLocaleString('fa-IR')} تومان</p>
                    <p className="text-xs text-slate-500">
                      {order.paymentStatus === 'paid' ? 'پرداخت شده' : order.paymentStatus === 'failed' ? 'ناموفق' : 'در انتظار پرداخت'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}

function StatCard({ label, value, loading }: { label: string, value: string | number, loading?: boolean }) {
    return (
        <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">
                {loading ? '...' : value}
            </p>
        </article>
    );
}
