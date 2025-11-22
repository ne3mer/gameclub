'use client';

import { useState } from 'react';
import { Match } from '@/types/tournament';
import { Icon } from '@/components/icons/Icon';
import ScreenshotUpload from '@/components/arena/ScreenshotUpload';
import { API_BASE_URL } from '@/lib/api';

interface DisputeFormProps {
  match: Match;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DisputeForm({ match, onSuccess, onCancel }: DisputeFormProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('لطفاً دلیل اعتراض را وارد کنید');
      return;
    }
    if (evidence.length === 0) {
      setError('لطفاً حداقل یک مدرک (اسکرین‌شات) آپلود کنید');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/arena/disputes/${match._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: `${reason} - ${description}`, // Combining for now as backend takes reason string
          evidence
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'خطا در ثبت اعتراض');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (url: string) => {
    setEvidence([...evidence, url]);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
          <Icon name="alert" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">گزارش تخلف / اعتراض</h3>
          <p className="text-sm text-slate-400">
            لطفاً مدارک کافی برای اثبات ادعای خود ارائه دهید
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reason Select */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            دلیل اعتراض
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition"
          >
            <option value="">انتخاب کنید...</option>
            <option value="cheating">تقلب (Cheating)</option>
            <option value="toxic">رفتار نامناسب (Toxic Behavior)</option>
            <option value="wrong_result">نتیجه اشتباه</option>
            <option value="absence">عدم حضور حریف</option>
            <option value="other">سایر موارد</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            توضیحات تکمیلی
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition resize-none"
            placeholder="توضیحات دقیق در مورد مشکل پیش آمده..."
          />
        </div>

        {/* Evidence Upload */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            مدارک (اسکرین‌شات/ویدیو)
            <span className="text-red-500 mr-1">*</span>
          </label>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {evidence.map((url, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden border border-slate-700 aspect-video">
                <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setEvidence(evidence.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            ))}
          </div>

          <ScreenshotUpload onUpload={handleUpload} />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <Icon name="alert" size={16} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال ثبت...
              </>
            ) : (
              <>
                <Icon name="send" size={20} />
                ثبت اعتراض
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
