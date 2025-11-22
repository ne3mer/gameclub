'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';

export default function AdminMessagesPage() {
  const [target, setTarget] = useState<'all' | 'tournament' | 'user'>('all');
  const [type, setType] = useState<'email' | 'telegram' | 'both'>('both');
  const [targetId, setTargetId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);

  useEffect(() => {
    if (target === 'tournament') {
      fetchTournaments();
    }
  }, [target]);

  const fetchTournaments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/arena/tournaments?limit=100`); // Fetch plenty
      const data = await res.json();
      setTournaments(data.tournaments);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('آیا از ارسال این پیام اطمینان دارید؟')) return;

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target,
          targetId: target === 'all' ? undefined : targetId,
          type,
          subject,
          message
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'خطا در ارسال پیام');

      setResult(data);
      // Reset form partially
      setMessage('');
      setSubject('');
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">ارسال پیام</h1>
          <p className="text-sm text-slate-500 mt-1">ارسال اعلان گروهی یا تکی به کاربران</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSend} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            {/* Target Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">گیرندگان</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'all', label: 'همه کاربران', icon: 'users' },
                  { id: 'tournament', label: 'شرکت‌کنندگان تورنمنت', icon: 'trophy' },
                  { id: 'user', label: 'کاربر خاص', icon: 'user' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTarget(opt.id as any)}
                    className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center gap-2 transition ${
                      target === opt.id
                        ? 'bg-purple-50 border-purple-500 text-purple-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon name={opt.icon as any} size={20} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Target Input */}
            {target === 'tournament' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">انتخاب تورنمنت</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                >
                  <option value="">انتخاب کنید...</option>
                  {tournaments.map(t => (
                    <option key={t._id} value={t._id}>{t.title}</option>
                  ))}
                </select>
              </div>
            )}

            {target === 'user' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">شناسه کاربر (User ID)</label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="مثال: 65a..."
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition font-mono"
                />
              </div>
            )}

            {/* Message Type */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">نوع ارسال</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={type === 'email'}
                    onChange={() => setType('email')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span>ایمیل</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={type === 'telegram'}
                    onChange={() => setType('telegram')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span>تلگرام</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={type === 'both'}
                    onChange={() => setType('both')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span>هر دو</span>
                </label>
              </div>
            </div>

            {/* Subject (Email only) */}
            {(type === 'email' || type === 'both') && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">موضوع ایمیل</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="موضوع پیام..."
                  required={type === 'email' || type === 'both'}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                />
              </div>
            )}

            {/* Message Body */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">متن پیام</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="متن پیام خود را بنویسید..."
                required
                rows={6}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Icon name="send" size={20} />
                  ارسال پیام
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results / Tips */}
        <div className="space-y-6">
          {result && (
            <div className={`rounded-3xl border p-6 ${result.error ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
              {result.error ? (
                <div className="text-rose-600">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Icon name="alert" size={20} />
                    خطا در ارسال
                  </h3>
                  <p className="text-sm">{result.error}</p>
                </div>
              ) : (
                <div className="text-emerald-800">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-600">
                    <Icon name="check" size={20} />
                    ارسال موفق
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>تعداد کل گیرندگان:</span>
                      <span className="font-bold">{result.results.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ارسال ایمیل:</span>
                      <span className="font-bold">{result.results.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ارسال تلگرام:</span>
                      <span className="font-bold">{result.results.telegram}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>خطا:</span>
                      <span className="font-bold">{result.results.errors}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Icon name="info" size={20} className="text-blue-500" />
              راهنما
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 list-disc list-inside">
              <li>برای ارسال به همه کاربران، گزینه "همه کاربران" را انتخاب کنید.</li>
              <li>برای اطلاع‌رسانی در مورد یک تورنمنت خاص (مثل تاخیر یا تغییر قوانین)، از گزینه "شرکت‌کنندگان تورنمنت" استفاده کنید.</li>
              <li>پیام‌های تلگرام فقط برای کاربرانی ارسال می‌شود که ربات را استارت زده باشند.</li>
              <li>ایمیل‌ها ممکن است به پوشه اسپم بروند، از عناوین مناسب استفاده کنید.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
