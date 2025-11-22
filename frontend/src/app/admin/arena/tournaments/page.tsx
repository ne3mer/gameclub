'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';
import { Tournament } from '@/types/tournament';

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTournaments();
  }, [page]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/arena/tournaments?page=${page}&limit=10&sort=-createdAt`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('خطا در دریافت لیست تورنمنت‌ها');
      
      const data = await res.json();
      setTournaments(data.tournaments);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این تورنمنت اطمینان دارید؟')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/arena/tournaments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('خطا در حذف تورنمنت');
      
      fetchTournaments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">مدیریت تورنمنت‌ها</h1>
          <p className="text-sm text-slate-500 mt-1">ایجاد و مدیریت تورنمنت‌های آرنا</p>
        </div>
        <Link
          href="/admin/arena/tournaments/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white transition hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20"
        >
          <Icon name="plus" size={20} />
          تورنمنت جدید
        </Link>
      </div>

      {/* Stats Cards (Placeholder for now, can be dynamic later) */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="تورنمنت‌های فعال"
          value={tournaments.filter(t => t.status === 'in-progress' || t.status === 'registration-open').length.toString()}
          icon="chart"
          color="emerald"
        />
        <StatCard
          label="کل تورنمنت‌ها"
          value={tournaments.length.toString()}
          icon="users"
          color="blue"
        />
        {/* Add more stats as needed */}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">عنوان</th>
                <th className="px-6 py-4 font-bold">بازی</th>
                <th className="px-6 py-4 font-bold">وضعیت</th>
                <th className="px-6 py-4 font-bold">شرکت‌کنندگان</th>
                <th className="px-6 py-4 font-bold">تاریخ شروع</th>
                <th className="px-6 py-4 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      در حال بارگذاری...
                    </div>
                  </td>
                </tr>
              ) : tournaments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    هیچ تورنمنتی یافت نشد
                  </td>
                </tr>
              ) : (
                tournaments.map((tournament) => (
                  <tr key={tournament._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden relative">
                           {/* Assuming game image is available, otherwise placeholder */}
                           <img src={tournament.game.image} alt={tournament.game.name} className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{tournament.title}</p>
                          <p className="text-xs text-slate-500">{tournament.type} • {tournament.format}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {tournament.game.name}
                      <span className="block text-xs text-slate-400">{tournament.game.platform}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tournament.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {tournament.currentPlayers} / {tournament.maxPlayers}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(tournament.startDate).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/arena/tournaments/${tournament._id}/manage`}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="مدیریت"
                        >
                          <Icon name="settings" size={18} />
                        </Link>
                        <Link
                          href={`/admin/arena/tournaments/${tournament._id}/edit`}
                          className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                          title="ویرایش"
                        >
                          <Icon name="edit" size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(tournament._id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                          title="حذف"
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded border border-slate-200 disabled:opacity-50"
              >
                قبلی
              </button>
              <span className="px-3 py-1 text-slate-600">
                صفحه {page} از {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded border border-slate-200 disabled:opacity-50"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colors = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    rose: 'from-rose-500 to-rose-600',
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[color as keyof typeof colors]} text-white`}>
          <Icon name={icon as any} size={24} />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    upcoming: 'bg-blue-50 text-blue-600 border-blue-200',
    'registration-open': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'registration-closed': 'bg-amber-50 text-amber-600 border-amber-200',
    'in-progress': 'bg-purple-50 text-purple-600 border-purple-200',
    completed: 'bg-slate-50 text-slate-600 border-slate-200',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  const labels = {
    upcoming: 'به زودی',
    'registration-open': 'ثبت‌نام باز',
    'registration-closed': 'ثبت‌نام بسته',
    'in-progress': 'در حال برگزاری',
    completed: 'تکمیل شده',
    cancelled: 'لغو شده',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles] || styles.upcoming}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
