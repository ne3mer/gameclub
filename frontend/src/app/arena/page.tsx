import { Metadata } from 'next';
import ArenaHero from '@/components/arena/ArenaHero';
import FeaturedTournaments from '@/components/arena/FeaturedTournaments';
import TournamentGrid from '@/components/arena/TournamentGrid';
import HallOfFame from '@/components/arena/HallOfFame';
import HowItWorks from '@/components/arena/HowItWorks';

export const metadata: Metadata = {
  title: 'آرنا - تورنمنت‌های بازی | NextPlay',
  description: 'به آرنا بازی‌های آنلاین بپیوندید، در تورنمنت‌ها شرکت کنید و جوایز نقدی ببرید',
};

export default function ArenaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <ArenaHero />

      {/* Featured Tournaments */}
      <section className="relative z-10 -mt-20">
        <FeaturedTournaments />
      </section>

      {/* Tournament Grid */}
      <section className="relative z-10 py-20">
        <TournamentGrid />
      </section>

      {/* Hall of Fame */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent">
        <HallOfFame />
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20">
        <HowItWorks />
      </section>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
    </main>
  );
}
