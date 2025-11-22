'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: {
      name: '',
      platform: 'PS5',
      image: ''
    },
    type: 'solo',
    format: 'single-elimination',
    entryFee: 0,
    prizePool: {
      total: 0,
      distribution: {
        first: 0,
        second: 0,
        third: 0
      }
    },
    maxPlayers: 16,
    startDate: '',
    registrationDeadline: '',
    banner: '',
    rules: [''],
    requirements: {
      psnId: false,
      activisionId: false,
      epicId: false,
      minLevel: 0
    }
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGameChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      game: { ...prev.game, [field]: value }
    }));
  };

  const handlePrizeChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      prizePool: {
        ...prev.prizePool,
        distribution: { ...prev.prizePool.distribution, [field]: Number(value) }
      }
    }));
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const addRule = () => {
    setFormData(prev => ({ ...prev, rules: [...prev.rules, ''] }));
  };

  const removeRule = (index: number) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Calculate total prize from distribution if 0
      const totalPrize = formData.prizePool.total || 
        (formData.prizePool.distribution.first + formData.prizePool.distribution.second + formData.prizePool.distribution.third);

      const payload = {
        ...formData,
        prizePool: {
          ...formData.prizePool,
          total: totalPrize
        }
      };

      const res = await fetch(`${API_BASE_URL}/api/arena/tournaments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'خطا در ایجاد تورنمنت');
      }

      router.push('/admin/arena/tournaments');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition"
        >
          <Icon name="arrow-right" size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">ایجاد تورنمنت جدید</h1>
          <p className="text-sm text-slate-500">اطلاعات تورنمنت را وارد کنید</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Icon name="info" size={20} className="text-purple-600" />
            اطلاعات پایه
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">عنوان تورنمنت</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                placeholder="مثال: تورنمنت هفتگی وارزون"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">توضیحات</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition h-32 resize-none"
                placeholder="توضیحات کامل در مورد تورنمنت..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">نام بازی</label>
              <input
                type="text"
                value={formData.game.name}
                onChange={(e) => handleGameChange('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                placeholder="مثال: Call of Duty: Warzone"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">پلتفرم</label>
              <select
                value={formData.game.platform}
                onChange={(e) => handleGameChange('platform', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
              >
                <option value="PS5">PS5</option>
                <option value="PS4">PS4</option>
                <option value="Xbox">Xbox</option>
                <option value="PC">PC</option>
                <option value="Cross-Platform">Cross-Platform</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">تصویر بنر (URL)</label>
              <input
                type="url"
                value={formData.banner}
                onChange={(e) => handleChange('banner', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                placeholder="https://..."
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">تصویر بازی (URL)</label>
              <input
                type="url"
                value={formData.game.image}
                onChange={(e) => handleGameChange('image', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                placeholder="https://..."
                required
              />
            </div>
          </div>
        </section>

        {/* Format & Schedule */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Icon name="calendar" size={20} className="text-purple-600" />
            فرمت و زمان‌بندی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">نوع بازی</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
              >
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
                <option value="1v1">1v1</option>
                <option value="kill-race">Kill Race</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">فرمت برگزاری</label>
              <select
                value={formData.format}
                onChange={(e) => handleChange('format', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
              >
                <option value="single-elimination">Single Elimination</option>
                <option value="double-elimination">Double Elimination</option>
                <option value="round-robin">Round Robin</option>
                <option value="battle-royale">Battle Royale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ظرفیت (نفر/تیم)</label>
              <input
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => handleChange('maxPlayers', parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                min="2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">حداقل سطح مورد نیاز</label>
              <input
                type="number"
                value={formData.requirements.minLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: { ...prev.requirements, minLevel: parseInt(e.target.value) } }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">تاریخ شروع</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">مهلت ثبت‌نام</label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => handleChange('registrationDeadline', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>
          </div>
        </section>

        {/* Prizes */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Icon name="award" size={20} className="text-purple-600" />
            جوایز و هزینه ورودی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">هزینه ورودی (تومان)</label>
              <input
                type="number"
                value={formData.entryFee}
                onChange={(e) => handleChange('entryFee', parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">مجموع جوایز (تومان)</label>
              <input
                type="number"
                value={formData.prizePool.total}
                onChange={(e) => setFormData(prev => ({ ...prev, prizePool: { ...prev.prizePool, total: parseInt(e.target.value) } }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                min="0"
                placeholder="محاسبه خودکار در صورت خالی بودن"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">جایزه نفر اول</label>
              <input
                type="number"
                value={formData.prizePool.distribution.first}
                onChange={(e) => handlePrizeChange('first', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">جایزه نفر دوم</label>
              <input
                type="number"
                value={formData.prizePool.distribution.second}
                onChange={(e) => handlePrizeChange('second', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">جایزه نفر سوم</label>
              <input
                type="number"
                value={formData.prizePool.distribution.third}
                onChange={(e) => handlePrizeChange('third', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                min="0"
              />
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Icon name="file" size={20} className="text-purple-600" />
            قوانین تورنمنت
          </h2>
          <div className="space-y-4">
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
                  placeholder={`قانون شماره ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="p-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                >
                  <Icon name="trash" size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRule}
              className="flex items-center gap-2 text-purple-600 font-bold hover:text-purple-700 transition"
            >
              <Icon name="plus" size={20} />
              افزودن قانون جدید
            </button>
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white hover:from-purple-500 hover:to-pink-500 transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {loading ? 'در حال ایجاد...' : 'ایجاد تورنمنت'}
          </button>
        </div>
      </form>
    </div>
  );
}
