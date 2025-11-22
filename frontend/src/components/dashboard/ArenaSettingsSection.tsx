'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';
import TelegramConnect from '@/components/profile/TelegramConnect';

export default function ArenaSettingsSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    gameTag: {
      psn: '',
      activision: '',
      epic: ''
    },
    bankInfo: {
      cardNumber: '',
      iban: '',
      accountHolder: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormData({
          gameTag: {
            psn: data.gameTag?.psn || '',
            activision: data.gameTag?.activision || '',
            epic: data.gameTag?.epic || ''
          },
          bankInfo: {
            cardNumber: data.bankInfo?.cardNumber || '',
            iban: data.bankInfo?.iban || '',
            accountHolder: data.bankInfo?.accountHolder || ''
          }
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/profile/arena-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('خطا در ذخیره اطلاعات');

      setMessage({ type: 'success', text: 'تنظیمات با موفقیت ذخیره شد' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center text-sm text-slate-500">در حال بارگذاری تنظیمات...</div>;

  return (
    <div className="space-y-6">
      {/* Telegram Connect */}
      <TelegramConnect />

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-8">
        
        {/* Game Tags */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Icon name="game" className="text-purple-500" />
            شناسه‌های بازی (Game Tags)
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">PlayStation ID</label>
              <input
                type="text"
                value={formData.gameTag.psn}
                onChange={e => setFormData({...formData, gameTag: {...formData.gameTag, psn: e.target.value}})}
                placeholder="Online ID"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-purple-500 outline-none transition text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Activision ID</label>
              <input
                type="text"
                value={formData.gameTag.activision}
                onChange={e => setFormData({...formData, gameTag: {...formData.gameTag, activision: e.target.value}})}
                placeholder="Name#1234567"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-purple-500 outline-none transition text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Epic Games ID</label>
              <input
                type="text"
                value={formData.gameTag.epic}
                onChange={e => setFormData({...formData, gameTag: {...formData.gameTag, epic: e.target.value}})}
                placeholder="Display Name"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-purple-500 outline-none transition text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Bank Info */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Icon name="credit-card" className="text-emerald-500" />
            اطلاعات بانکی (برای واریز جوایز)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">شماره کارت</label>
              <input
                type="text"
                value={formData.bankInfo.cardNumber}
                onChange={e => setFormData({...formData, bankInfo: {...formData.bankInfo, cardNumber: e.target.value}})}
                placeholder="۶۰۳۷..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">شماره شبا (IR)</label>
              <input
                type="text"
                value={formData.bankInfo.iban}
                onChange={e => setFormData({...formData, bankInfo: {...formData.bankInfo, iban: e.target.value}})}
                placeholder="IR..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition text-sm font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">نام صاحب حساب</label>
              <input
                type="text"
                value={formData.bankInfo.accountHolder}
                onChange={e => setFormData({...formData, bankInfo: {...formData.bankInfo, accountHolder: e.target.value}})}
                placeholder="نام و نام خانوادگی کامل"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition text-sm"
              />
            </div>
          </div>
        </div>

        {/* Message & Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            {message && (
              <span className={`text-sm font-bold ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {message.text}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </form>
    </div>
  );
}
