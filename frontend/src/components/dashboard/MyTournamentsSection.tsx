'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/icons/Icon';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

interface TournamentParticipation {
  _id: string;
  tournamentId: {
    _id: string;
    title: string;
    slug: string;
    game: {
      name: string;
      image: string;
    };
    prizePool: {
      total: number;
    };
    startDate: string;
    status: string;
  };
  status: string;
  currentRound: number;
  prizeWon: number;
  prizeStatus: string;
  registeredAt: string;
}

export default function MyTournamentsSection() {
  const [tournaments, setTournaments] = useState<{
    active: TournamentParticipation[];
    completed: TournamentParticipation[];
    upcoming: TournamentParticipation[];
  }>({
    active: [],
    completed: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTournaments();
  }, []);

  const fetchMyTournaments = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/arena/my/tournaments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 py-10 text-center text-sm text-slate-500">
        در حال بارگذاری تورنمنت‌ها...
      </div>
    );
  }

  const allTournaments = [...tournaments.active, ...tournaments.upcoming, ...tournaments.completed];

  if (allTournaments.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
          <Icon name="award" size={32} className="text-purple-400" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-900">هنوز در تورنمنتی شرکت نکرده‌اید</h3>
        <p className="mb-6 text-sm text-slate-500">
          در تورنمنت‌های هیجان‌انگیز شرکت کنید و جوایز نقدی ببرید
        </p>
        <Link
          href="/arena"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white transition hover:from-purple-500 hover:to-pink-500"
        >
          <Icon name="award" size={18} />
          مشاهده تورنمنت‌ها
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Tournaments */}
      {tournaments.active.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">تورنمنت‌های فعال</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {tournaments.active.map((participation) => (
              <TournamentCard key={participation._id} participation={participation} type="active" />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Tournaments */}
      {tournaments.upcoming.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">تورنمنت‌های آینده</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {tournaments.upcoming.map((participation) => (
              <TournamentCard key={participation._id} participation={participation} type="upcoming" />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tournaments */}
      {tournaments.completed.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">تورنمنت‌های پایان یافته</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {tournaments.completed.map((participation) => (
              <TournamentCard key={participation._id} participation={participation} type="completed" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TournamentCard({ participation, type }: { participation: TournamentParticipation; type: string }) {
  const statusColors = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    eliminated: 'bg-rose-50 text-rose-600 border-rose-200',
    winner: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    registered: 'bg-blue-50 text-blue-600 border-blue-200'
  };

  const statusLabels = {
    active: 'فعال',
    eliminated: 'حذف شده',
    winner: 'برنده',
    registered: 'ثبت‌نام شده'
  };

  return (
    <Link href={`/arena/tournaments/${participation.tournamentId.slug}`}>
      <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-purple-200">
        {/* Game Image */}
        <div className="relative mb-4 h-32 overflow-hidden rounded-2xl">
          <Image
            src={participation.tournamentId.game.image || '/images/default-game.jpg'}
            alt={participation.tournamentId.game.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm ${statusColors[participation.status as keyof typeof statusColors] || statusColors.registered}`}>
              {statusLabels[participation.status as keyof typeof statusLabels] || participation.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {participation.tournamentId.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Icon name="game" size={14} />
            <span>{participation.tournamentId.game.name}</span>
          </div>

          {/* Prize Info */}
          {participation.prizeWon > 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-700">جایزه شما</span>
                <span className="text-sm font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {participation.prizeWon.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              {participation.prizeStatus === 'pending' && (
                <p className="mt-1 text-xs text-yellow-600">در انتظار پرداخت</p>
              )}
              {participation.prizeStatus === 'paid' && (
                <p className="mt-1 text-xs text-emerald-600">✓ پرداخت شده</p>
              )}
            </div>
          )}

          {/* Tournament Info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              جایزه کل: {participation.tournamentId.prizePool.total.toLocaleString('fa-IR')} تومان
            </span>
            {type === 'active' && (
              <span className="text-purple-600 font-bold">
                راند {participation.currentRound}
              </span>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Icon name="calendar" size={14} />
            <span>
              {type === 'upcoming' ? 'شروع: ' : 'ثبت‌نام: '}
              {new Date(type === 'upcoming' ? participation.tournamentId.startDate : participation.registeredAt).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
