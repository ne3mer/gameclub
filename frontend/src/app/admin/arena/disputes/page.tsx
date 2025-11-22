'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const statusQuery = filter !== 'all' ? `?status=${filter}` : '';
      
      const res = await fetch(`${API_BASE_URL}/api/arena/disputes${statusQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('خطا در دریافت اعتراضات');
      
      const data = await res.json();
      setDisputes(data.disputes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (matchId: string, resolution: string, winnerId?: string) => {
    if (!confirm('آیا از ثبت این نتیجه اطمینان دارید؟')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/arena/disputes/${matchId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resolution,
          winnerId
        })
      });

      if (!res.ok) throw new Error('خطا در حل اعتراض');

      fetchDisputes(); // Refresh list
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">مرکز حل اختلاف</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت اعتراضات و گزارش‌های تخلف</p>
        </div>
        <div className="flex bg-white rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              filter === 'open' ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            باز ({disputes.filter(d => d.dispute.status === 'open').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              filter === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            حل شده
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

      {/* Disputes List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <Icon name="check" size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">هیچ اعتراضی یافت نشد</p>
          </div>
        ) : (
          disputes.map((match) => (
            <div key={match._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    match.dispute.status === 'open' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {match.dispute.status === 'open' ? 'باز' : 'حل شده'}
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {match.tournamentId?.title} • {match.roundName}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(match.dispute.createdAt || match.updatedAt).toLocaleString('fa-IR')}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Dispute Details */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                      <Icon name="alert" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">گزارش شده توسط: {match.dispute.reportedBy?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">دلیل: {match.dispute.reason}</p>
                    </div>
                  </div>

                  {match.dispute.evidence && match.dispute.evidence.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-bold text-slate-700 mb-2">مدارک ارائه شده:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {match.dispute.evidence.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-lg overflow-hidden border border-slate-200 hover:opacity-80 transition">
                            <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Match Info & Actions */}
                <div className="border-r border-slate-100 pr-8 mr-8 lg:block hidden">
                   {/* Match Players */}
                   <div className="bg-slate-50 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700">بازیکن ۱</span>
                        <span className="text-sm font-bold text-slate-900">{match.player1?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">بازیکن ۲</span>
                        <span className="text-sm font-bold text-slate-900">{match.player2?.name}</span>
                      </div>
                   </div>

                   {match.dispute.status === 'open' && (
                     <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-900">اقدام مدیریتی:</p>
                        <button
                          onClick={() => handleResolve(match._id, 'تایید ادعای گزارش‌دهنده', match.dispute.reportedBy?._id)}
                          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition flex items-center justify-center gap-2"
                        >
                          <Icon name="check" size={18} />
                          تایید ادعا (برنده: {match.dispute.reportedBy?.name})
                        </button>
                        
                        {/* Determine the other player */}
                        {(() => {
                           const otherPlayer = match.player1?._id === match.dispute.reportedBy?._id ? match.player2 : match.player1;
                           return (
                             <button
                               onClick={() => handleResolve(match._id, 'رد ادعا و تایید حریف', otherPlayer?._id)}
                               className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2"
                             >
                               <Icon name="x" size={18} />
                               رد ادعا (برنده: {otherPlayer?.name})
                             </button>
                           );
                        })()}

                        <button
                          onClick={() => handleResolve(match._id, 'لغو مسابقه', undefined)}
                          className="w-full py-3 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition flex items-center justify-center gap-2"
                        >
                          <Icon name="trash" size={18} />
                          لغو مسابقه
                        </button>
                     </div>
                   )}
                   
                   {match.dispute.status === 'resolved' && (
                     <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                       <p className="text-emerald-700 font-bold text-sm mb-1">حل شده توسط: {match.dispute.resolvedBy?.name}</p>
                       <p className="text-emerald-600 text-xs">{match.dispute.resolution}</p>
                     </div>
                   )}
                </div>
                
                {/* Mobile Actions (Visible only on small screens) */}
                <div className="lg:hidden block border-t border-slate-100 pt-4">
                   {/* Simplified actions for mobile */}
                   {match.dispute.status === 'open' && (
                     <div className="space-y-2">
                        <button
                          onClick={() => handleResolve(match._id, 'تایید ادعای گزارش‌دهنده', match.dispute.reportedBy?._id)}
                          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold"
                        >
                          تایید ادعا
                        </button>
                        <button
                          onClick={() => {
                             const otherPlayer = match.player1?._id === match.dispute.reportedBy?._id ? match.player2 : match.player1;
                             handleResolve(match._id, 'رد ادعا', otherPlayer?._id);
                          }}
                          className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold"
                        >
                          رد ادعا
                        </button>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
