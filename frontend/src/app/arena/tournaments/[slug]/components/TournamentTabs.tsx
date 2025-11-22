'use client';

import { useState } from 'react';
import { Tournament, TournamentParticipant } from '@/types/tournament';
import { Icon } from '@/components/icons/Icon';
import BracketViewer from './BracketViewer';

type TabType = 'overview' | 'rules' | 'prizes' | 'bracket' | 'participants';

export default function TournamentTabs({
  tournament,
  participants,
  myParticipation
}: {
  tournament: Tournament;
  participants: TournamentParticipant[];
  myParticipation?: TournamentParticipant;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'نمای کلی', icon: 'info' },
    { id: 'rules' as TabType, label: 'قوانین', icon: 'file' },
    { id: 'prizes' as TabType, label: 'جوایز', icon: 'award' },
    { id: 'bracket' as TabType, label: 'براکت', icon: 'git-branch' },
    { id: 'participants' as TabType, label: 'شرکت‌کنندگان', icon: 'users' }
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-slate-800 overflow-x-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }
              `}
            >
              <Icon name={tab.icon as any} size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'overview' && <OverviewTab tournament={tournament} />}
        {activeTab === 'rules' && <RulesTab rules={tournament.rules} />}
        {activeTab === 'prizes' && <PrizesTab prizePool={tournament.prizePool} />}
        {activeTab === 'bracket' && <BracketTab tournament={tournament} />}
        {activeTab === 'participants' && <ParticipantsTab participants={participants} />}
      </div>
    </div>
  );
}

function OverviewTab({ tournament }: { tournament: Tournament }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-3">درباره تورنمنت</h3>
        <p className="text-slate-300 leading-relaxed">{tournament.description}</p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-3">فرمت مسابقه</h3>
        <p className="text-slate-300">{tournament.format}</p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-3">الزامات</h3>
        <div className="space-y-2">
          {tournament.requirements.psnId && (
            <div className="flex items-center gap-2 text-slate-300">
              <Icon name="check" size={16} className="text-emerald-400" />
              <span>PSN ID الزامی است</span>
            </div>
          )}
          {tournament.requirements.activisionId && (
            <div className="flex items-center gap-2 text-slate-300">
              <Icon name="check" size={16} className="text-emerald-400" />
              <span>Activision ID الزامی است</span>
            </div>
          )}
          {tournament.requirements.epicId && (
            <div className="flex items-center gap-2 text-slate-300">
              <Icon name="check" size={16} className="text-emerald-400" />
              <span>Epic ID الزامی است</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RulesTab({ rules }: { rules: string[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">قوانین تورنمنت</h3>
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {index + 1}
            </div>
            <p className="text-slate-300 leading-relaxed">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrizesTab({ prizePool }: { prizePool: Tournament['prizePool'] }) {
  const prizes = [
    { place: 'اول', amount: prizePool.distribution.first, color: 'from-yellow-400 to-orange-400', icon: '🥇' },
    { place: 'دوم', amount: prizePool.distribution.second, color: 'from-slate-300 to-slate-400', icon: '🥈' },
    { place: 'سوم', amount: prizePool.distribution.third, color: 'from-orange-400 to-orange-600', icon: '🥉' },
  ].filter(p => p.amount);

  return (
    <div className="space-y-6">
      <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <p className="text-sm text-slate-400 mb-2">جایزه کل</p>
        <p className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          {prizePool.total.toLocaleString('fa-IR')} تومان
        </p>
      </div>

      <div className="grid gap-4">
        {prizes.map((prize, index) => (
          <div key={index} className="flex items-center justify-between p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{prize.icon}</span>
              <div>
                <p className="text-lg font-bold text-white">مقام {prize.place}</p>
                <p className="text-sm text-slate-400">
                  {((prize.amount! / prizePool.total) * 100).toFixed(0)}% از جایزه کل
                </p>
              </div>
            </div>
            <p className={`text-2xl font-black bg-gradient-to-r ${prize.color} bg-clip-text text-transparent`}>
              {prize.amount!.toLocaleString('fa-IR')} تومان
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketTab({ tournament }: { tournament: Tournament }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-4">
            <Icon name="layers" size={48} className="mb-4 opacity-50" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">براکت هنوز ایجاد نشده</h3>
      <p className="text-slate-400">
        براکت پس از بسته شدن ثبت‌نام و شروع تورنمنت نمایش داده می‌شود
      </p>
    </div>
  );
}

function ParticipantsTab({ participants }: { participants: TournamentParticipant[] }) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-4">
          <Icon name="users" size={32} className="text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">هنوز کسی ثبت‌نام نکرده</h3>
        <p className="text-slate-400">اولین نفری باشید که ثبت‌نام می‌کند!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {participants.map((participant, index) => (
        <div key={participant._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {index + 1}
            </div>
            <div>
              <p className="font-bold text-white">بازیکن {index + 1}</p>
              <p className="text-xs text-slate-400">
                ثبت‌نام: {new Date(participant.registeredAt).toLocaleDateString('fa-IR')}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            participant.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
          }`}>
            {participant.paymentStatus === 'success' ? 'پرداخت شده' : 'در انتظار پرداخت'}
          </span>
        </div>
      ))}
    </div>
  );
}
