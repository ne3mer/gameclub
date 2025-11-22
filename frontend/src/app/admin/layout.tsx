'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

type NavGroup = {
  title?: string;
  items: Array<{ href: string; label: string; icon: string; badge?: string }>;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sectionCounts, setSectionCounts] = useState({
    orders: 0,
    requests: 0,
    reviews: 0
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCounts = async () => {
      const token = getAuthToken();
      const headers = adminHeaders(false, token ? { Authorization: `Bearer ${token}` } : undefined);
      const nextCounts = { orders: 0, requests: 0, reviews: 0 };

      if (ADMIN_API_KEY) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/orders/admin?paymentStatus=pending&limit=1`,
            { headers }
          );
          if (response.ok) {
            const payload = await response.json().catch(() => null);
            nextCounts.orders = payload?.meta?.total ?? 0;
          }
        } catch (error) {
          console.warn('Failed to fetch pending orders count', error);
        }
      }

      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/game-requests/all`, {
            headers
          });
          if (response.ok) {
            const payload = await response.json().catch(() => null);
            nextCounts.requests = payload?.statistics?.pending ?? 0;
          }
        } catch (error) {
          console.warn('Failed to fetch game request stats', error);
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/reviews/admin/stats`, {
            headers
          });
          if (response.ok) {
            const payload = await response.json().catch(() => null);
            const stats = payload?.data ?? payload;
            nextCounts.reviews = stats?.pending ?? 0;
          }
        } catch (error) {
          console.warn('Failed to fetch review stats', error);
        }
      }

      if (isMounted) {
        setSectionCounts(nextCounts);
      }
    };

    fetchCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatBadge = (value?: number) => {
    if (!value || value <= 0) return undefined;
    return value > 99 ? '۹۹+' : value.toLocaleString('fa-IR');
  };

  const navGroups: NavGroup[] = [
    {
      items: [
        { href: '/admin', label: 'داشبورد', icon: 'dashboard' }
      ]
    },
    {
      title: 'فروش و سفارشات',
      items: [
        { href: '/admin/products', label: 'محصولات', icon: 'game' },
        { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: 'layers' },
        { href: '/admin/orders', label: 'سفارشات', icon: 'package', badge: formatBadge(sectionCounts.orders) },
        { href: '/admin/requests', label: 'درخواست‌های بازی', icon: 'message', badge: formatBadge(sectionCounts.requests) },
        { href: '/admin/users', label: 'کاربران', icon: 'users' },
        { href: '/admin/reviews', label: 'نظرات', icon: 'star', badge: formatBadge(sectionCounts.reviews) },
        { href: '/admin/analytics', label: 'آنالیتیکس فروش', icon: 'chart' },
        { href: '/admin/pageviews', label: 'آمار بازدید', icon: 'eye' }
      ]
    },
    {
      title: 'محتوا و طراحی',
      items: [
        { href: '/admin/home', label: 'صفحه اصلی', icon: 'home' },
        { href: '/admin/banners', label: 'بنرها', icon: 'palette' }
      ]
    },
    {
      title: 'آرنا و تورنمنت‌ها',
      items: [
        { href: '/admin/arena/tournaments', label: 'مدیریت تورنمنت‌ها', icon: 'award' }
      ]
    },
    {
      title: 'بازاریابی',
      items: [
        { href: '/admin/marketing', label: 'کمپین‌ها و تبلیغات', icon: 'megaphone' },
        { href: '/admin/coupons', label: 'کوپن‌های تخفیف', icon: 'gift' }
      ]
    }
  ];

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 transform border-l border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">GameClub</h1>
                <p className="text-xs text-emerald-100 mt-0.5">پنل مدیریت</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden rounded-lg p-2 hover:bg-white/20 transition text-white"
              >
                <Icon name="x" size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-2">
                {group.title && (
                  <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-[-2px]'
                        }`}
                      >
                        <Icon 
                          name={link.icon as any} 
                          size={20} 
                          className={`transition-transform ${isActive ? 'scale-110 text-white' : 'text-slate-600 group-hover:scale-110'}`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span className="flex-1">{link.label}</span>
                        {link.badge && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-white hover:text-emerald-600 transition-all duration-200 hover:shadow-sm"
            >
              <Icon name="home" size={18} className="text-slate-600" />
              <span>بازگشت به سایت</span>
            </Link>
            <div className="px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
              <span>نسخه 1.0.0</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm px-4 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded-xl p-2 hover:bg-slate-100 transition text-slate-600"
            >
              <Icon name="menu" size={24} />
            </button>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-emerald-50 px-4 py-2 rounded-full">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold">آنلاین</span>
              </div>
              <div className="text-sm text-slate-600 font-medium bg-slate-50 px-4 py-2 rounded-full">
                {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
    </AdminGuard>
  );
}
