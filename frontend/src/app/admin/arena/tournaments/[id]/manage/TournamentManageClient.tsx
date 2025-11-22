'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';
import { Tournament, TournamentParticipant, BracketNode } from '@/types/tournament';
import BracketViewer from '@/app/arena/tournaments/[slug]/components/BracketViewer';

interface TournamentManageClientProps {
  tournamentId: string;
}

type TabType = 'overview' | 'participants' | 'bracket' | 'disputes' | 'settings';

export default function TournamentManageClient({ tournamentId }: TournamentManageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [bracket, setBracket] = useState<BracketNode | null>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Tournament Details
      const tRes = await fetch(`${API_BASE_URL}/api/arena/tournaments/${tournamentId}`, { headers });
      if (!tRes.ok) throw new Error('خطا در دریافت اطلاعات تورنمنت');
      const tData = await tRes.json();
      setTournament(tData.tournament || tData);

      // Fetch Participants
      const pRes = await fetch(`${API_BASE_URL}/api/arena/tournaments/${tournamentId}/participants`, { headers });
      if (pRes.ok) {
        const pData = await pRes.json();
        setParticipants(pData.participants);
      }

      // Fetch Bracket (if exists)
      if (tData.tournament?.bracket || tData.bracket) {
        setBracket(tData.tournament?.bracket || tData.bracket);
      } else {
        // Try fetching separately if not included
        const bRes = await fetch(`${API_BASE_URL}/api/arena/brackets/${tournamentId}`, { headers });
        if (bRes.ok) {
          const bData = await bRes.json();
          setBracket(bData.bracket);
        }
      }

      // Fetch Disputes
      const dRes = await fetch(`${API_BASE_URL}/api/arena/disputes?tournamentId=${tournamentId}`, { headers });
      if (dRes.ok) {
        const dData = await dRes.json();
        setDisputes(dData.disputes);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    if (!confirm('آیا از ایجاد براکت اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/arena/brackets/${tournamentId}/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'خطا در ایجاد براکت');
      }

      alert('براکت با موفقیت ایجاد شد');
      fetchData(); // Refresh data
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleKickParticipant = async (userId: string) => {
    if (!confirm('آیا از حذف این شرکت‌کننده اطمینان دارید؟')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/arena/tournaments/${tournamentId}/participants/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('خطا در حذف شرکت‌کننده');

      setParticipants(prev => prev.filter(p => (p.userId as any)._id !== userId));
      // Actually participants.userId is populated object in getTournamentParticipants
      // So we need to filter by p.userId._id
      fetchData(); // Safer to refresh
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVerifyPayment = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/arena/tournaments/${tournamentId}/participants/${userId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ paymentStatus: 'success', status: 'active' }) // 'success' matches PaymentStatus type
      });

      if (!res.ok) throw new Error('خطا در تایید پرداخت');

      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) return <div>تورنمنت یافت نشد</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/arena/tournaments')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            <Icon name="arrow-right" size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{tournament.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                tournament.status === 'in-progress' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {tournament.status}
              </span>
              <span>•</span>
              <span>{participants.length} / {tournament.maxPlayers} شرکت‌کننده</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateBracket}
            disabled={!!bracket || participants.length < 2}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bracket ? 'براکت ایجاد شده' : 'ایجاد براکت'}
          </button>
          <button
            onClick={() => router.push(`/admin/arena/tournaments/${tournamentId}/edit`)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
          >
            ویرایش تنظیمات
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'نمای کلی', icon: 'dashboard' },
          { id: 'participants', label: 'شرکت‌کنندگان', icon: 'users' },
          { id: 'bracket', label: 'براکت و مسابقات', icon: 'layers' },
          { id: 'disputes', label: 'اعتراضات', icon: 'alert' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon name={tab.icon as any} size={18} />
            {tab.label}
            {tab.id === 'disputes' && disputes.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {disputes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">وضعیت ثبت‌نام</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500">تکمیل شده</span>
                <span className="font-bold text-slate-900">{Math.round((participants.length / tournament.maxPlayers) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(participants.length / tournament.maxPlayers) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-black text-slate-900">{participants.length}</div>
                  <div className="text-xs text-slate-500">ثبت‌نام شده</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-black text-slate-900">{tournament.maxPlayers - participants.length}</div>
                  <div className="text-xs text-slate-500">ظرفیت باقی‌مانده</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">وضعیت مالی</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">هزینه ورودی</span>
                  <span className="font-bold text-slate-900">{tournament.entryFee.toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">مجموع جوایز</span>
                  <span className="font-bold text-slate-900">{tournament.prizePool.total.toLocaleString()} تومان</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <span className="text-slate-500">درآمد کل (تخمینی)</span>
                  <span className="font-bold text-emerald-600">{(participants.length * tournament.entryFee).toLocaleString()} تومان</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">کاربر</th>
                  <th className="px-6 py-4">گیم تگ</th>
                  <th className="px-6 py-4">وضعیت پرداخت</th>
                  <th className="px-6 py-4">تاریخ ثبت‌نام</th>
                  <th className="px-6 py-4">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {p.userId.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.userId.name}</p>
                          <p className="text-xs text-slate-500">{p.userId.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {p.gameTag?.activision || p.gameTag?.psn || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        p.paymentStatus === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {p.paymentStatus === 'success' ? 'پرداخت شده' : 'در انتظار'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(p.registeredAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {p.paymentStatus !== 'success' && (
                          <button
                            onClick={() => handleVerifyPayment(p.userId._id)}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="تایید پرداخت دستی"
                          >
                            <Icon name="check" size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleKickParticipant(p.userId._id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                          title="حذف شرکت‌کننده"
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="bg-slate-900 rounded-3xl p-8 overflow-hidden min-h-[500px]">
            <BracketViewer bracket={bracket} tournamentId={tournamentId} />
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="space-y-4">
            {disputes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-3xl border border-slate-200">
                <Icon name="check" size={48} className="mx-auto mb-4 opacity-20" />
                <p>هیچ اعتراضی ثبت نشده است</p>
              </div>
            ) : (
              disputes.map((match: any) => (
                <div key={match._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900">اعتراض در بازی {match.roundName}</h4>
                      <p className="text-sm text-slate-500">گزارش شده توسط: {match.dispute.reportedBy?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      match.dispute.status === 'open' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {match.dispute.status === 'open' ? 'باز' : 'حل شده'}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl mb-4">
                    <p className="text-sm font-bold text-slate-700 mb-1">دلیل اعتراض:</p>
                    <p className="text-sm text-slate-600">{match.dispute.reason}</p>
                  </div>

                  {match.dispute.evidence && match.dispute.evidence.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {match.dispute.evidence.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                          <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {match.dispute.status === 'open' && (
                    <div className="flex gap-3 border-t border-slate-100 pt-4">
                      <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition">
                        تایید ادعا (تغییر برنده)
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition">
                        رد اعتراض
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
