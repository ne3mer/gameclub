'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';
import { formatToman } from '@/lib/format';

interface Order {
  _id: string;
  customerInfo: {
    name?: string;
    email: string;
    phone: string;
  };
  items: Array<{
    gameId: {
      title: string;
      coverUrl?: string;
    };
    pricePaid: number;
    quantity: number;
    selectedOptions?: Record<string, string>;
  }>;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  fulfillmentStatus: 'pending' | 'assigned' | 'delivered' | 'refunded';
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('gc_token');
        const headers: HeadersInit = {};
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
          headers
        });

        if (!response.ok) {
          throw new Error('سفارش یافت نشد');
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات سفارش');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusBadge = (status: string, type: 'payment' | 'fulfillment') => {
    const statusConfig = {
      payment: {
        pending: { label: 'در انتظار پرداخت', color: 'bg-amber-100 text-amber-700' },
        paid: { label: 'پرداخت شده', color: 'bg-emerald-100 text-emerald-700' },
        failed: { label: 'پرداخت ناموفق', color: 'bg-rose-100 text-rose-700' }
      },
      fulfillment: {
        pending: { label: 'در انتظار تحویل', color: 'bg-slate-100 text-slate-700' },
        assigned: { label: 'اختصاص داده شده', color: 'bg-blue-100 text-blue-700' },
        delivered: { label: 'تحویل داده شده', color: 'bg-emerald-100 text-emerald-700' },
        refunded: { label: 'بازگشت داده شده', color: 'bg-rose-100 text-rose-700' }
      }
    };

    const config = statusConfig[type][status as keyof typeof statusConfig[typeof type]];
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-rose-100 p-6">
          <svg className="h-12 w-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'سفارش یافت نشد'}</h2>
        <Link
          href="/orders"
          className="mt-4 rounded-2xl bg-emerald-500 px-8 py-3 font-bold text-white transition hover:bg-emerald-600"
        >
          بازگشت به سفارشات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l7-7-7-7" />
            </svg>
            بازگشت به سفارشات
          </Link>
          <h1 className="text-2xl font-black text-slate-900">جزئیات سفارش</h1>
          <p className="mt-1 text-sm text-slate-500">
            شماره سفارش: <span className="font-mono font-bold">{order._id.slice(-8).toUpperCase()}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">وضعیت سفارش</h2>
            <div className="flex flex-wrap gap-3">
              {getStatusBadge(order.paymentStatus, 'payment')}
              {getStatusBadge(order.fulfillmentStatus, 'fulfillment')}
            </div>
            <div className="mt-4 text-sm text-slate-500">
              تاریخ ثبت: {new Date(order.createdAt).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">اطلاعات تماس</h2>
            <div className="space-y-2 text-sm">
              {order.customerInfo.name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">نام:</span>
                  <span className="font-bold text-slate-900">{order.customerInfo.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">ایمیل:</span>
                <span className="font-bold text-slate-900" dir="ltr">{order.customerInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">موبایل:</span>
                <span className="font-bold text-slate-900" dir="ltr">{order.customerInfo.phone}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">محصولات سفارش</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
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
                    <div className="font-bold text-slate-900">{formatToman(item.pricePaid * item.quantity)}</div>
                    <div className="text-xs text-slate-500">تومان</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-lg font-black text-slate-900">
              <span>مبلغ کل:</span>
              <span>{formatToman(order.totalAmount)} تومان</span>
            </div>
          </div>

          {/* Account Delivery Info */}
          {order.paymentStatus === 'paid' && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="mb-3 text-lg font-bold text-emerald-900">اطلاعات تحویل</h2>
              {order.fulfillmentStatus === 'delivered' ? (
                <div className="text-sm text-emerald-800">
                  <p className="mb-2">✅ اطلاعات اکانت به ایمیل شما ارسال شده است.</p>
                  <p>لطفاً ایمیل خود را بررسی کنید یا از طریق پنل کاربری به اطلاعات دسترسی داشته باشید.</p>
                </div>
              ) : (
                <div className="text-sm text-emerald-800">
                  <p>اطلاعات اکانت به زودی به ایمیل <strong>{order.customerInfo.email}</strong> ارسال خواهد شد.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
