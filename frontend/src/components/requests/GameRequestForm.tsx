'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { createGameRequest } from '@/lib/api/game-requests';
import confetti from 'canvas-confetti';

const PLATFORMS = [
  { value: 'PS5', label: 'PlayStation 5', icon: '🎮', color: 'from-blue-500 to-blue-600' },
  { value: 'PS4', label: 'PlayStation 4', icon: '🎮', color: 'from-indigo-500 to-indigo-600' },
  { value: 'Xbox Series X/S', label: 'Xbox Series X/S', icon: '🎯', color: 'from-green-500 to-green-600' },
  { value: 'Xbox One', label: 'Xbox One', icon: '🎯', color: 'from-emerald-500 to-emerald-600' },
  { value: 'PC', label: 'PC / Steam', icon: '💻', color: 'from-purple-500 to-purple-600' },
  { value: 'Nintendo Switch', label: 'Nintendo Switch', icon: '🕹️', color: 'from-red-500 to-red-600' },
  { value: 'Other', label: 'سایر', icon: '🎲', color: 'from-slate-500 to-slate-600' }
];

const REGIONS = [
  { value: 'USA', label: 'آمریکا', flag: '🇺🇸' },
  { value: 'Europe', label: 'اروپا', flag: '🇪🇺' },
  { value: 'Turkey', label: 'ترکیه', flag: '🇹🇷' },
  { value: 'UAE', label: 'امارات', flag: '🇦🇪' },
  { value: 'Asia', label: 'آسیا', flag: '🌏' },
  { value: 'Other', label: 'سایر', flag: '🌍' }
];

export function GameRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    gameName: '',
    platform: '',
    region: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createGameRequest(formData);
      
      // Success animation
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Reset form
      setTimeout(() => {
        setFormData({
          gameName: '',
          platform: '',
          region: '',
          description: ''
        });
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت درخواست');
    } finally {
      setLoading(false);
    }
  };

  const charCount = formData.description.length;
  const maxChars = 1000;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
            درخواست بازی جدید
          </span>
        </div>
        <h2 className="text-3xl font-black text-slate-900">بازی مورد نظرت رو پیدا نکردی؟</h2>
        <p className="mt-2 text-slate-600">نگران نباش! بهمون بگو و ما اضافه‌ش می‌کنیم</p>
      </div>

      {/* Game Name */}
      <div className="group">
        <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon name="game" size={16} />
          نام بازی
        </label>
        <input
          type="text"
          required
          value={formData.gameName}
          onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
          placeholder="مثلاً: God of War Ragnarök"
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-slate-900 transition focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
        />
      </div>

      {/* Platform Selection */}
      <div>
        <label className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon name="layers" size={16} />
          پلتفرم
        </label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.value}
              type="button"
              onClick={() => setFormData({ ...formData, platform: platform.value })}
              className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-center transition ${
                formData.platform === platform.value
                  ? 'border-purple-500 bg-gradient-to-br ' + platform.color + ' text-white shadow-lg'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300'
              }`}
            >
              <div className="text-3xl mb-2">{platform.icon}</div>
              <div className="text-xs font-bold">{platform.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Region Selection */}
      <div>
        <label className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon name="globe" size={16} />
          منطقه / ریجن
        </label>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {REGIONS.map((region) => (
            <button
              key={region.value}
              type="button"
              onClick={() => setFormData({ ...formData, region: region.value })}
              className={`rounded-2xl border-2 p-3 text-center transition ${
                formData.region === region.value
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="text-2xl mb-1">{region.flag}</div>
              <div className="text-xs font-bold text-slate-700">{region.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon name="message" size={16} />
          توضیحات (اختیاری)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="اگر توضیحات بیشتری داری (مثلاً نسخه خاص، DLC، و...) اینجا بنویس..."
          rows={4}
          maxLength={maxChars}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-slate-900 transition focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">حداکثر {maxChars.toLocaleString('fa-IR')} کاراکتر</span>
          <span className={`font-bold ${charCount > maxChars * 0.9 ? 'text-orange-500' : 'text-slate-400'}`}>
            {charCount.toLocaleString('fa-IR')} / {maxChars.toLocaleString('fa-IR')}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <div className="flex items-center gap-2">
            <Icon name="alert" size={16} />
            {error}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600">
          <div className="flex items-center gap-2">
            <Icon name="check" size={16} />
            درخواست شما با موفقیت ثبت شد! 🎉
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !formData.gameName || !formData.platform || !formData.region}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-purple-500/70"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              در حال ارسال...
            </>
          ) : (
            <>
              <Icon name="send" size={20} />
              ثبت درخواست
            </>
          )}
        </span>
      </button>

      {/* Info Box */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
              <Icon name="info" size={20} />
            </div>
          </div>
          <div className="text-sm text-slate-700">
            <p className="font-bold text-slate-900 mb-1">چطور کار می‌کنه؟</p>
            <p>درخواستت رو ثبت کن، تیم ما بررسی می‌کنه و در اسرع وقت بازی رو به کاتالوگ اضافه می‌کنیم. وقتی بازی اضافه شد، یک نوتیفیکیشن بهت میاد! 🔔</p>
          </div>
        </div>
      </div>
    </form>
  );
}
