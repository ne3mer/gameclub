'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';
import { Tournament } from '@/types/tournament';
import { Icon } from '@/components/icons/Icon';
import { RegistrationForm } from '../components/RegistrationForm';

export default function TournamentRegisterClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userGameTag, setUserGameTag] = useState<string>('');

  useEffect(() => {
    fetchTournamentAndUser();
  }, [slug]);

  const fetchTournamentAndUser = async () => {
    try {
      // Fetch Tournament
      const tourRes = await fetch(`${API_BASE_URL}/api/arena/tournaments/slug/${slug}`);
      if (!tourRes.ok) throw new Error('Tournament not found');
      const tourData = await tourRes.json();
      
      if (tourData.myParticipation) {
        router.push(`/arena/tournaments/${slug}`);
        return;
      }
      setTournament(tourData.tournament);

      // Fetch User Profile if logged in
      const token = localStorage.getItem('token');
      if (token) {
        const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          // Pre-fill game tag based on game type (psn, activision, epic)
          // Assuming tournament.game.platform or similar exists, or just check all
          // For now, let's try to find a matching tag or just use any available
          const tags = userData.gameTag || {};
          // Simple logic: try to find a tag that matches the game name or platform, otherwise pick first available
          // Since we don't have strict mapping yet, let's just pass the most likely one or empty
          // If the game is Call of Duty, prefer activision. If Fortnite, Epic. If FIFA, PSN/Xbox.
          // Let's just pass the whole object or a best guess?
          // RegistrationForm expects a string. Let's try to guess.
          const gameName = tourData.tournament.game.name.toLowerCase();
          let prefill = '';
          if (gameName.includes('duty')) prefill = tags.activision;
          else if (gameName.includes('fortnite')) prefill = tags.epic;
          else prefill = tags.psn || tags.activision || tags.epic || '';
          
          setUserGameTag(prefill);
        }
      }
    } catch (err) {
      setError('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">{error || 'تورنمنت یافت نشد'}</h1>
        <button onClick={() => router.back()} className="text-purple-400 hover:text-purple-300">
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <Image
          src={tournament.game.image || '/images/default-game.jpg'}
          alt={tournament.game.name}
          fill
          className="object-cover opacity-20 blur-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">{tournament.title}</h1>
            <p className="text-slate-400">تکمیل ثبت‌نام و پرداخت ورودی</p>
          </div>

          {/* Info Card */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
              <span className="text-slate-400">هزینه ورودی</span>
              <span className="text-xl font-bold text-white">
                {tournament.entryFee.toLocaleString('fa-IR')} تومان
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ظرفیت باقی‌مانده</span>
              <span className="text-emerald-400 font-bold">
                {tournament.maxPlayers - tournament.currentPlayers} نفر
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <RegistrationForm 
            tournamentId={tournament._id} 
            initialGameTag={userGameTag}
            onSuccess={(paymentUrl) => {
              // Redirect to payment or show success
              window.location.href = paymentUrl;
            }}
          />

          <button 
            onClick={() => router.back()}
            className="w-full mt-6 text-slate-500 hover:text-slate-300 text-sm font-medium transition"
          >
            انصراف و بازگشت
          </button>
        </div>
      </div>
    </div>
  );
}
