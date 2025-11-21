'use client';

import { useState, useEffect } from 'react';
import { GameRequestForm } from '@/components/requests/GameRequestForm';
import { GameRequestsList } from '@/components/requests/GameRequestsList';
import { getUserGameRequests, deleteGameRequest, type GameRequest } from '@/lib/api/game-requests';
import { Icon } from '@/components/icons/Icon';

export default function GameRequestsPage() {
  const [requests, setRequests] = useState<GameRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getUserGameRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت درخواست‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این درخواست را حذف کنید؟')) {
      return;
    }

    try {
      await deleteGameRequest(id);
      setRequests(requests.filter(r => r._id !== id));
    } catch (err: any) {
      alert(err.message || 'خطا در حذف درخواست');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-4 py-2">
            <Icon name="game" size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              درخواست بازی
            </span>
          </div>
          <h1 className="mb-3 text-4xl font-black text-slate-900 md:text-5xl">
            بازی مورد نظرت رو پیدا نکردی؟
          </h1>
          <p className="text-lg text-slate-600">
            درخواست بده و ما اضافه‌ش می‌کنیم!
          </p>
        </div>

        {/* Request Form */}
        <div className="mb-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-12">
          <GameRequestForm onSuccess={fetchRequests} />
        </div>

        {/* My Requests */}
        <div>
          <h2 className="mb-6 text-2xl font-black text-slate-900">درخواست‌های من</h2>
          
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <p className="mt-4 text-slate-600">در حال بارگذاری...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
              <Icon name="alert" size={32} className="mx-auto mb-2" />
              {error}
            </div>
          ) : (
            <GameRequestsList requests={requests} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
}
