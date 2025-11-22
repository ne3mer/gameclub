'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayouts();
  }, [filter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const statusQuery = filter !== 'all' ? `?status=${filter}` : '';
      
      const res = await fetch(`${API_BASE_URL}/api/arena/payouts${statusQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('خطا در دریافت لیست پرداخت‌ها');
      
      const data = await res.json();
      setPayouts(data.payouts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id: string, status: 'paid' | 'failed', note?: string) => {
    if (!confirm(`آیا از تغییر وضعیت به ${status === 'paid' ? 'پرداخت شده' : 'ناموفق'} اطمینان دارید؟`)) return;

    try {
      setProcessingId(id);
      const token = localStorage.getItem('token');
      
      const payload: any = { status };
      if (status === 'paid') {
        payload.transactionRef = prompt('شماره پیگیری تراکنش (اختیاری):') || undefined;
      } else {
        payload.failureReason = prompt('دلیل عدم پرداخت:') || 'مشکل در اطلاعات بانکی';
      }

      const res = await fetch(`${API_BASE_URL}/api/arena/payouts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('خطا در پردازش پرداخت');

      fetchPayouts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">مدیریت جوایز</h1>
          <p className="text-sm text-slate-500 mt-1">بررسی و واریز جوایز برندگان</p>
        </div>
        <div className="flex bg-white rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              filter === 'pending' ? 'bg-amber-50 text-amber-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            در انتظار ({payouts.filter(p => p.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              filter === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            پرداخت شده
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              filter === 'all' ? 'bg-slate-100 text-slate-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            همه
          </button>
        </div>
      </div>

      {/* Payouts List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Icon name="check" size={48} className="mx-auto mb-4 opacity-20" />
            <p>هیچ درخواستی یافت نشد</p>
          </div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">کاربر</th>
                <th className="px-6 py-4">تورنمنت / مقام</th>
                <th className="px-6 py-4">مبلغ (تومان)</th>
                <th className="px-6 py-4">اطلاعات واریز</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {p.userId?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{p.userId?.name}</p>
                        <p className="text-xs text-slate-500">{p.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{p.tournamentId?.title}</p>
                    <p className="text-xs text-slate-500">مقام {p.placement}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
                    {p.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {p.method === 'bank-transfer' ? (
                      <div>
                        <p className="font-bold text-slate-700">{p.bankInfo?.accountHolder}</p>
                        <p className="text-xs text-slate-500 font-mono">{p.bankInfo?.cardNumber || p.bankInfo?.iban}</p>
                      </div>
                    ) : (
                      <span className="font-mono text-xs">{p.walletAddress || 'Wallet'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                      p.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {p.status === 'paid' ? 'پرداخت شده' : 
                       p.status === 'pending' ? 'در انتظار' : 'ناموفق'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleProcess(p._id, 'paid')}
                          disabled={processingId === p._id}
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                          title="تایید پرداخت"
                        >
                          <Icon name="check" size={18} />
                        </button>
                        <button
                          onClick={() => handleProcess(p._id, 'failed')}
                          disabled={processingId === p._id}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                          title="رد درخواست"
                        >
                          <Icon name="x" size={18} />
                        </button>
                      </div>
                    )}
                    {p.status === 'paid' && p.transactionRef && (
                      <span className="text-xs text-slate-400 font-mono">Ref: {p.transactionRef}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
