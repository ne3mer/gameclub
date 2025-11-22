'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { Tournament, TournamentParticipant, Match } from '@/types/tournament';
import TournamentHeader from './components/TournamentHeader';
import InfoCards from './components/InfoCards';
import TournamentTabs from './components/TournamentTabs';
import RegistrationCTA from './components/RegistrationCTA';
import MatchResultForm from './components/MatchResultForm';

interface TournamentDetailsData {
  tournament: Tournament;
  participants: TournamentParticipant[];
  myParticipation?: TournamentParticipant;
  upcomingMatch?: Match;
}

export default function TournamentDetailsClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [data, setData] = useState<TournamentDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournamentDetails();
  }, [slug]);

  const fetchTournamentDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/arena/tournaments/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('تورنمنت یافت نشد');
        } else {
          setError('خطا در دریافت اطلاعات');
        }
        return;
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching tournament:', err);
      setError('خطا در برقراری ارتباط');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-slate-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">{error || 'خطا'}</h1>
          <button
            onClick={() => router.push('/arena')}
            className="mt-4 px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition"
          >
            بازگشت به آرنا
          </button>
        </div>
      </div>
    );
  }

  const { tournament, participants, myParticipation, upcomingMatch } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <TournamentHeader tournament={tournament} />

      {/* Info Cards */}
      <div className="container mx-auto px-4">
        <InfoCards 
          tournament={tournament} 
          participantCount={participants.length}
        />
      </div>

      {/* Active Match Section */}
      {upcomingMatch && (upcomingMatch.status === 'scheduled' || upcomingMatch.status === 'in-progress') && (
        <div className="container mx-auto px-4 mt-8">
          <MatchResultForm 
            match={upcomingMatch} 
            onSuccess={() => {
              fetchTournamentDetails();
              // Show success message
            }} 
          />
        </div>
      )}

      {/* Tabs */}
      <div className="container mx-auto px-4 py-12">
        <TournamentTabs 
          tournament={tournament}
          participants={participants}
          myParticipation={myParticipation}
        />
      </div>

      {/* Registration CTA */}
      {tournament.status === 'registration-open' && !myParticipation && (
        <RegistrationCTA tournament={tournament} />
      )}

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
    </div>
  );
}
