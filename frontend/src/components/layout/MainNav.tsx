'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartIcon } from '@/components/cart/CartIcon';
import { clearAuthSession, API_BASE_URL } from '@/lib/api';
import { isAdmin, type StoredUser, getAuthToken } from '@/lib/auth';

const links = [
  { href: '/', label: 'خانه' },
  { href: '/games', label: 'کاتالوگ بازی' }
];

export const MainNav = () => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const syncUserFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('gc_token');
    const stored = localStorage.getItem('gc_user');

    if (token && stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setShowAdminLink(isAdmin());
        fetchUnreadCount();
      } catch {
        setUser(null);
        setShowAdminLink(false);
      }
    } else {
      setUser(null);
      setShowAdminLink(false);
      setUnreadNotifications(0);
    }
  }, []);

  const fetchUnreadCount = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data?.data?.count || 0);
      }
    } catch (err) {
      // Silent fail
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncUserFromStorage();

    const handleAuthChange = () => syncUserFromStorage();
    window.addEventListener('gc-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('gc-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [syncUserFromStorage]);

  const accountLabel = useMemo(() => {
    if (!user) return 'ورود';
    const baseName = user.name ?? user.fullName ?? '';
    if (!baseName.trim()) return 'حساب من';
    const firstName = baseName.trim().split(' ')[0];
    return `سلام ${firstName}`;
  }, [user]);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/40 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="text-lg font-black text-slate-900">
          GameClub Iran
        </Link>
        <div className="hidden gap-6 text-sm font-semibold text-slate-600 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-emerald-600">
              {link.label}
            </Link>
          ))}
          {showAdminLink && (
            <Link href="/admin" className="transition hover:text-emerald-600">
              مدیریت
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <CartIcon />
          {user && (
            <Link
              href="/account"
              className="relative rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                🔔
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </span>
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                {accountLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                خروج
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link
                href="/login"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-600 transition hover:bg-slate-50"
              >
                ورود
              </Link>
              <Link
                href="/register"
                className="rounded-2xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                ثبت‌نام
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
