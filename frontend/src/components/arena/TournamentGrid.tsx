'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/icons/Icon';
import { Tournament, TournamentFilters } from '@/types/tournament';
import { API_BASE_URL } from '@/lib/api';

export default function TournamentGrid() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TournamentFilters>({
    status: 'registration-open'
  });

  useEffect(() => {
    fetchTournaments();
  }, [filters]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.game) params.append('game', filters.game);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      
      const response = await fetch(`${API_BASE_URL}/api/arena/tournaments?${params}`);
      const data = await response.json();
      setTournaments(data.tournaments || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="tournaments" className="container mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          همه <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">تورنمنت‌ها</span>
        </h2>
        <p className="text-slate-400 text-lg">تورنمنت مورد علاقه خود را پیدا کنید</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <FilterButton
          active={filters.status === 'registration-open'}
          onClick={() => setFilters({ ...filters, status: 'registration-open' })}
          icon="door-open"
        >
          ثبت‌نام باز
        </FilterButton>
        <FilterButton
          active={filters.status === 'upcoming'}
          onClick={() => setFilters({ ...filters, status: 'upcoming' })}
          icon="calendar"
        >
          به زودی
        </FilterButton>
        <FilterButton
          active={filters.status === 'in-progress'}
          onClick={() => setFilters({ ...filters, status: 'in-progress' })}
          icon="play"
        >
          در حال برگزاری
        </FilterButton>
        <FilterButton
          active={filters.status === 'completed'}
          onClick={() => setFilters({ ...filters, status: 'completed' })}
          icon="check-circle"
        >
          پایان یافته
        </FilterButton>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tournaments.map((tournament, index) => (
            <TournamentCard key={tournament._id} tournament={tournament} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-4">
            <Icon name="search" size={32} className="text-slate-600" />
          </div>
          <p className="text-slate-400 text-lg">تورنمنتی یافت نشد</p>
        </div>
      )}
    </div>
  );
}

function FilterButton({ children, active, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-xl font-bold transition-all
        ${active
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
        }
      `}
    >
      <span className="flex items-center gap-2">
        <Icon name={icon} size={18} />
        {children}
      </span>
    </button>
  );
}

function TournamentCard({ tournament, index }: { tournament: Tournament; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/arena/tournaments/${tournament.slug}`}>
        <div className="group relative h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
          {/* Game Image */}
          <div className="relative h-40 overflow-hidden">
            <Image
              src={tournament.game.image || '/images/default-game.jpg'}
              alt={tournament.game.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
              {tournament.title}
            </h3>

            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-400 font-bold">
                {tournament.prizePool.total.toLocaleString('fa-IR')} تومان
              </span>
              <span className="text-slate-400">
                {tournament.currentPlayers}/{tournament.maxPlayers}
              </span>
            </div>

            <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
