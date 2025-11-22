'use client';

import { Tournament } from '@/types/tournament';
import { Icon } from '@/components/icons/Icon';

export default function InfoCards({ 
  tournament, 
  participantCount 
}: { 
  tournament: Tournament;
  participantCount: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-10 md:-mt-20 relative z-10">
      {/* Prize Pool Card */}
      <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
            <Icon name="award" size={24} className="text-white" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-2">جایزه کل</p>
        <p className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          {tournament.prizePool.total.toLocaleString('fa-IR')}
        </p>
        <p className="text-xs text-slate-500 mt-1">تومان</p>
      </div>

      {/* Entry Fee Card */}
      <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <Icon name="credit-card" size={24} className="text-white" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-2">هزینه ورودی</p>
        <p className="text-3xl font-black text-white">
          {tournament.entryFee.toLocaleString('fa-IR')}
        </p>
        <p className="text-xs text-slate-500 mt-1">تومان</p>
      </div>

      {/* Players Card */}
      <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Icon name="users" size={24} className="text-white" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-2">شرکت‌کنندگان</p>
        <p className="text-3xl font-black text-white">
          {participantCount}/{tournament.maxPlayers}
        </p>
        <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(participantCount / tournament.maxPlayers) * 100}%` }}
          />
        </div>
      </div>

      {/* Schedule Card */}
      <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
            <Icon name="calendar" size={24} className="text-white" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-2">شروع تورنمنت</p>
        <p className="text-lg font-black text-white">
          {new Date(tournament.startDate).toLocaleDateString('fa-IR', {
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {new Date(tournament.startDate).toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}
