'use client';

import Image from 'next/image';
import { Tournament } from '@/types/tournament';
import { Icon } from '@/components/icons/Icon';
import { useEffect, useState } from 'react';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function TournamentHeader({ tournament }: { tournament: Tournament }) {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(tournament.startDate).getTime();
      const difference = start - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [tournament.startDate]);

  const getStatusColor = () => {
    switch (tournament.status) {
      case 'registration-open': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      case 'in-progress': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'completed': return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
      default: return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
    }
  };

  const getStatusLabel = () => {
    switch (tournament.status) {
      case 'registration-open': return 'ثبت‌نام باز';
      case 'in-progress': return 'در حال برگزاری';
      case 'completed': return 'پایان یافته';
      case 'upcoming': return 'به زودی';
      default: return tournament.status;
    }
  };

  return (
    <div className="relative h-[500px] overflow-hidden">
      {/* Background Image */}
      <Image
        src={tournament.game.image || '/images/default-game.jpg'}
        alt={tournament.game.name}
        fill
        className="object-cover"
        priority
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-4 pb-12">
          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm font-bold text-sm ${getStatusColor()}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {getStatusLabel()}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 max-w-4xl">
            {tournament.title}
          </h1>

          {/* Game Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-slate-300">
              <Icon name="game" size={20} />
              <span className="font-semibold">{tournament.game.name}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-2 text-slate-300">
              <Icon name="users" size={20} />
              <span className="font-semibold">{tournament.type === 'solo' ? 'تکی' : tournament.type === '1v1' ? '۱ در ۱' : 'تیمی'}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-2 text-slate-300">
              <Icon name="award" size={20} />
              <span className="font-semibold">{tournament.format}</span>
            </div>
          </div>

          {/* Countdown */}
          {tournament.status === 'registration-open' || tournament.status === 'upcoming' ? (
            <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-sm border border-slate-700">
              <Icon name="clock" size={24} className="text-cyan-400" />
              <div className="flex items-center gap-2">
                <TimeUnit value={timeLeft.days} label="روز" />
                <span className="text-slate-600">:</span>
                <TimeUnit value={timeLeft.hours} label="ساعت" />
                <span className="text-slate-600">:</span>
                <TimeUnit value={timeLeft.minutes} label="دقیقه" />
                <span className="text-slate-600">:</span>
                <TimeUnit value={timeLeft.seconds} label="ثانیه" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black text-white bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
