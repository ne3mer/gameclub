'use client';

import Link from 'next/link';
import { Tournament } from '@/types/tournament';
import { Icon } from '@/components/icons/Icon';

export default function RegistrationCTA({ tournament }: { tournament: Tournament }) {
  const spotsLeft = tournament.maxPlayers - tournament.currentPlayers;
  const isAlmostFull = spotsLeft <= 5;

  return (
    <>
      {/* Desktop - Floating Card */}
      <div className="hidden lg:block fixed bottom-8 left-8 z-50">
        <div className="w-80 rounded-3xl border border-purple-500/50 bg-slate-900/95 backdrop-blur-xl p-6 shadow-2xl shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400">هزینه ورودی</p>
              <p className="text-2xl font-black text-white">
                {tournament.entryFee.toLocaleString('fa-IR')} تومان
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
              <Icon name="award" size={24} className="text-white" />
            </div>
          </div>

          <div className="mb-4 p-3 rounded-xl bg-slate-800/50">
            <p className="text-xs text-slate-400 mb-1">جایزه اول</p>
            <p className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {tournament.prizePool.distribution.first.toLocaleString('fa-IR')} تومان
            </p>
          </div>

          {isAlmostFull && (
            <div className="mb-4 flex items-center gap-2 text-amber-400 text-sm">
              <Icon name="alert" size={16} />
              <span className="font-bold">فقط {spotsLeft} جا باقی مانده!</span>
            </div>
          )}

          <Link
            href={`/arena/tournaments/${tournament.slug}/register`}
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white text-center hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/50 hover:scale-105"
          >
            ثبت‌نام در تورنمنت
          </Link>
        </div>
      </div>

      {/* Mobile - Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400">ورودی</p>
            <p className="text-lg font-black text-white">
              {tournament.entryFee.toLocaleString('fa-IR')} تومان
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">جایزه اول</p>
            <p className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {tournament.prizePool.distribution.first.toLocaleString('fa-IR')}
            </p>
          </div>
        </div>
        
        <Link
          href={`/arena/tournaments/${tournament.slug}/register`}
          className="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white text-center"
        >
          ثبت‌نام در تورنمنت
        </Link>
      </div>
    </>
  );
}
