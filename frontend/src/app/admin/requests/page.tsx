'use client';

import { useState, useEffect } from 'react';
import { getAllGameRequests, updateGameRequestStatus, deleteGameRequest, type GameRequest, type GameRequestStats } from '@/lib/api/game-requests';
import { Icon } from '@/components/icons/Icon';

const STATUS_OPTIONS = [
  { value: 'all', label: 'همه' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'approved', label: 'تایید شده' },
  { value: 'rejected', label: 'رد شده' },
  { value: 'fulfilled', label: 'موجود شد' }
];

export default function AdminGameRequestsPage() {
  const [requests, setRequests] = useState<GameRequest[]>([]);
  const [stats, setStats] = useState<GameRequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseData, setResponseData] = useState({ status: '', adminResponse: '' });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, statistics } = await getAllGameRequests(filter);
      setRequests(data);
      setStats(statistics);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleRespond = async (id: string) => {
    if (!responseData.status) {
      alert('لطفاً وضعیت را انتخاب کنید');
      return;
    }

    try {
      await updateGameRequestStatus(id, responseData.status, responseData.adminResponse);
      setRespondingTo(null);
      setResponseData({ status: '', adminResponse: '' });
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'خطا در به‌روزرسانی');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;

    try {
      await deleteGameRequest(id);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'خطا در حذف');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-black text-slate-900">مدیریت درخواست‌های بازی</h1>
          <p className="text-slate-600">مدیریت و پاسخ به درخواست‌های کاربران</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-3xl font-black text-slate-900">{stats.total.toLocaleString('fa-IR')}</div>
              <div className="text-sm text-slate-600">کل درخواست‌ها</div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="text-3xl font-black text-amber-700">{stats.pending.toLocaleString('fa-IR')}</div>
              <div className="text-sm text-amber-600">در انتظار</div>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <div className="text-3xl font-black text-blue-700">{stats.approved.toLocaleString('fa-IR')}</div>
              <div className="text-sm text-blue-600">تایید شده</div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="text-3xl font-black text-red-700">{stats.rejected.toLocaleString('fa-IR')}</div>
              <div className="text-sm text-red-600">رد شده</div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="text-3xl font-black text-emerald-700">{stats.fulfilled.toLocaleString('fa-IR')}</div>
              <div className="text-sm text-emerald-600">موجود شد</div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                filter === option.value
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-purple-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Icon name="game" size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600">درخواستی یافت نشد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-black text-slate-900">{request.gameName}</h3>
                    <div className="mb-2 flex gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold">
                        {request.platform}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold">
                        {request.region}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        request.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    {request.description && (
                      <p className="mb-2 text-sm text-slate-600">{request.description}</p>
                    )}
                    <p className="text-xs text-slate-500">
                      {new Date(request.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRespondingTo(respondingTo === request._id ? null : request._id)}
                      className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-600 hover:bg-purple-100"
                    >
                      پاسخ
                    </button>
                    <button
                      onClick={() => handleDelete(request._id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
                    >
                      حذف
                    </button>
                  </div>
                </div>

                {respondingTo === request._id && (
                  <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4">
                    <div className="mb-3">
                      <label className="mb-2 block text-sm font-bold text-slate-900">وضعیت</label>
                      <select
                        value={responseData.status}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="approved">تایید شده</option>
                        <option value="rejected">رد شده</option>
                        <option value="fulfilled">موجود شد</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="mb-2 block text-sm font-bold text-slate-900">پاسخ (اختیاری)</label>
                      <textarea
                        value={responseData.adminResponse}
                        onChange={(e) => setResponseData({ ...responseData, adminResponse: e.target.value })}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
                        placeholder="پیام برای کاربر..."
                      />
                    </div>
                    <button
                      onClick={() => handleRespond(request._id)}
                      className="rounded-xl bg-purple-500 px-6 py-2 text-sm font-bold text-white hover:bg-purple-600"
                    >
                      ثبت پاسخ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
