'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, persistAuthSession } from '@/lib/api';

export default function RegisterPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const telegram = formData.get('telegram')?.toString().trim();
    const password = formData.get('password')?.toString();
    const passwordConfirm = formData.get('passwordConfirm')?.toString();

    if (!name || !email || !password || !passwordConfirm) {
      setStatus('error');
      setMessage('تمام فیلدهای ضروری را تکمیل کنید.');
      return;
    }

    if (password !== passwordConfirm) {
      setStatus('error');
      setMessage('رمز عبور و تکرار آن یکسان نیست.');
      return;
    }

    const payload = {
      name,
      email,
      phone: phone || undefined,
      telegram: telegram || undefined,
      password,
      passwordConfirm
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message ?? 'ثبت نام با خطا روبه‌رو شد.');
      }

      persistAuthSession(data?.data?.token, data?.data?.user);
      setStatus('success');
      setMessage('ثبت نام انجام شد! در حال انتقال به حساب کاربری.');
      setTimeout(() => router.push('/account'), 1000);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'ثبت نام انجام نشد.');
    }
  };

  return (
    <div className="bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-100 bg-white p-8 shadow-lg">
        <p className="text-sm text-emerald-600">عضویت جدید</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">ورود به GameClub</h1>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <label className="text-sm">
            نام و نام خانوادگی
            <input name="name" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="مثلاً سارا احمدی" />
          </label>
          <label className="text-sm">
            ایمیل
            <input type="email" name="email" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="you@email.com" />
          </label>
          <label className="text-sm">
            شماره موبایل
            <input name="phone" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="09xxxxxxxxx" />
          </label>
          <label className="text-sm">
            آی‌دی تلگرام (اختیاری)
            <input name="telegram" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="@gameclub" />
          </label>
          <label className="text-sm">
            رمز عبور
            <input type="password" name="password" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="text-sm">
            تکرار رمز
            <input type="password" name="passwordConfirm" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="sm:col-span-2 flex items-center gap-2 text-xs text-slate-500">
            <input type="checkbox" className="accent-emerald-500" required />
            قوانین و گارانتی GameClub را می‌پذیرم.
          </label>
          <button
            type="submit"
            className="sm:col-span-2 rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white disabled:opacity-60"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'در حال ساخت حساب...' : 'ساخت حساب'}
          </button>
          {message && (
            <p className={`sm:col-span-2 text-xs ${status === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>{message}</p>
          )}
          <p className="sm:col-span-2 text-center text-xs text-slate-500">
            حساب دارید؟ <Link href="/login" className="font-semibold text-emerald-600">ورود</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
