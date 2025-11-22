'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/icons/Icon';
import { Tournament } from '@/types/tournament';
import { API_BASE_URL } from '@/lib/api';

export default function FeaturedTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTournaments();
  }, []);

  const fetchFeaturedTournaments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/arena/tournaments/featured`);
      const data = await response.json();
      setTournaments(data.tournaments || []);
    } catch (error) {
      console.error('Error fetching featured tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4"
        >
          <Icon name="star" size={16} className="text-purple-400" />
          <span className="text-sm font-bold text-purple-400">تورنمنت‌های ویژه</span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          تورنمنت‌های <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">پیشنهادی</span>
        </h2>
        <p className="text-slate-400 text-lg">بهترین تورنمنت‌ها با بالاترین جوایز</p>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament, index) => (
          <TournamentCard key={tournament._id} tournament={tournament} index={index} />
        ))}
      </div>
    </div>
  );
}

function TournamentCard({ tournament, index }: { tournament: Tournament; index: number }) {
  const timeUntilStart = new Date(tournament.startDate).getTime() - Date.now();
  const daysLeft = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/arena/tournaments/${tournament.slug}`}>
        <div className="group relative h-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
          {/* Game Banner */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={tournament.game.image || '/images/default-game.jpg'}
              alt={tournament.game.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold backdrop-blur-sm">
                {tournament.status === 'registration-open' ? 'ثبت‌نام باز' : 'به زودی'}
              </span>
            </div>

            {/* Featured Badge */}
            {tournament.featured && (
              <div className="absolute top-4 left-4">
                <div className="p-2 rounded-full bg-yellow-500/20 border border-yellow-500/50 backdrop-blur-sm">
                  <Icon name="star" size={16} className="text-yellow-400" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <h3 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors line-clamp-2">
              {tournament.title}
            </h3>

            {/* Game Info */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Icon name="game" size={16} />
              <span>{tournament.game.name}</span>
              <span className="text-slate-600">•</span>
              <span>{tournament.type === 'solo' ? 'تکی' : tournament.type === '1v1' ? '۱ در ۱' : 'تیمی'}</span>
            </div>

            {/* Prize Pool */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div>
                <div className="text-xs text-slate-400 mb-1">جایزه کل</div>
                <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {tournament.prizePool.total.toLocaleString('fa-IR')} تومان
                </div>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/20">
                <Icon name="award" size={24} className="text-yellow-400" />
              </div>
            </div>

            {/* Entry Fee & Players */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Icon name="credit-card" size={16} />
                <span>ورودی: {tournament.entryFee.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Icon name="users" size={16} />
                <span>{tournament.currentPlayers}/{tournament.maxPlayers}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>

            {/* Countdown */}
            {timeUntilStart > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Icon name="clock" size={16} className="text-cyan-400" />
                <span className="text-slate-400">
                  شروع در: <span className="text-cyan-400 font-bold">{daysLeft} روز و {hoursLeft} ساعت</span>
                </span>
              </div>
            )}

            {/* CTA */}
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white hover:from-purple-500 hover:to-pink-500 transition-all group-hover:shadow-lg group-hover:shadow-purple-500/50">
              مشاهده جزئیات
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
