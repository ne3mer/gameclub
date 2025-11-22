'use client';

import { useState } from 'react';
import { Match } from '@/types/tournament';
import { Icon } from '@/components/icons/Icon';
import ScreenshotUpload from '@/components/arena/ScreenshotUpload';
import DisputeForm from './DisputeForm';
import { API_BASE_URL } from '@/lib/api';

interface MatchResultFormProps {
  match: Match;
  onSuccess: () => void;
}

export default function MatchResultForm({ match, onSuccess }: MatchResultFormProps) {
  const [score, setScore] = useState<number>(0);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);

  if (showDispute) {
    return (
      <DisputeForm 
        match={match} 
        onSuccess={onSuccess} 
        onCancel={() => setShowDispute(false)} 
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      setError('لطفاً اسکرین‌شات نتیجه بازی را آپلود کنید');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/arena/matches/${match._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score,
          screenshot
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'خطا در ثبت نتیجه');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
          <Icon name="game" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">ثبت نتیجه مسابقه</h3>
          <p className="text-sm text-slate-400">
            {match.roundName} • {new Date(match.startTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Score Input */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            امتیاز شما
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              امتیاز / Kill
            </div>
          </div>
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            اسکرین‌شات نتیجه
            <span className="text-red-500 mr-1">*</span>
          </label>
          <ScreenshotUpload onUpload={setScreenshot} />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <Icon name="alert" size={16} />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال ثبت...
              </>
            ) : (
              <>
                <Icon name="check" size={20} />
                ثبت نتیجه
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setShowDispute(true)}
            className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold hover:bg-slate-700 hover:text-red-400 transition flex items-center justify-center gap-2"
          >
            <Icon name="alert" size={18} />
            گزارش مشکل / اعتراض
          </button>
        </div>
      </form>
    </div>
  );
}
