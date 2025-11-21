'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartIcon } from '@/components/cart/CartIcon';
import { clearAuthSession, API_BASE_URL } from '@/lib/api';
import { isAdmin, type StoredUser, getAuthToken } from '@/lib/auth';
import { Icon } from '@/components/icons/Icon';

const links = [
  { href: '/', label: 'خانه', icon: 'home' },
  { href: '/games', label: 'کاتالوگ بازی', icon: 'gamepad' },
  { href: '/about', label: 'درباره ما', icon: 'users' },
  { href: '/policies', label: 'قوانین', icon: 'file' }
];

export const MainNav = () => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (mobileMenuOpen) {
      const handleClickOutside = () => setMobileMenuOpen(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen]);

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
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-2xl">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-slate-900 transition hover:text-emerald-600">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <Icon name="game" size={20} />
            </div>
            <span className="hidden sm:block">GameClub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span>{link.label}</span>
              </Link>
            ))}
            {showAdminLink && (
              <Link
                href="/admin"
                className="group flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span>مدیریت</span>
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <div className="hidden sm:block">
              <CartIcon />
            </div>

            {/* Notifications (Desktop) */}
            {user && (
              <Link
                href="/account"
                className="relative hidden rounded-2xl p-2 text-slate-600 transition hover:bg-slate-50 sm:block"
              >
                <Icon name="bell" size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop Auth Buttons */}
            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    {accountLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    ورود
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
                  >
                    ثبت‌نام
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600 transition hover:bg-slate-50 md:hidden"
              aria-label="منوی موبایل"
            >
              {mobileMenuOpen ? (
                <Icon name="x" size={24} />
              ) : (
                <Icon name="menu" size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="absolute left-0 right-0 top-16 border-b border-slate-100 bg-white/95 backdrop-blur-2xl md:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1 px-4 py-4">
              {/* Mobile Navigation Links */}
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <span>{link.label}</span>
                </Link>
              ))}
              {showAdminLink && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <span>مدیریت</span>
                </Link>
              )}

              {/* Mobile Cart */}
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:hidden"
              >
                <Icon name="cart" size={18} />
                <span>سبد خرید</span>
              </Link>

              {/* Mobile Notifications */}
              {user && (
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:hidden"
                >
                  <div className="relative">
                    <Icon name="bell" size={18} />
                    {unreadNotifications > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </div>
                  <span>اعلان‌ها</span>
                </Link>
              )}

              {/* Mobile Auth Section */}
              <div className="border-t border-slate-100 pt-4 md:hidden">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                    >
                      {accountLabel}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      خروج
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      ورود
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
                    >
                      ثبت‌نام
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
