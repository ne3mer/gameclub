'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'داشبورد' },
    { href: '/admin/products', label: 'محصولات' },
    { href: '/admin/products/new', label: 'افزودن محصول' },
    { href: '/admin/home', label: 'محتوای صفحه اصلی' },
    { href: '/admin/marketing', label: 'بازاریابی' },
    { href: '/admin/orders', label: 'سفارشات' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-l border-slate-200 bg-white p-6 md:flex">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">GameClub</h1>
          <p className="text-xs text-slate-500">پنل مدیریت</p>
        </div>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-4 py-3 text-sm font-bold transition ${
                pathname === link.href
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-4">
            <Link href="/" className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50">
                بازگشت به سایت
            </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
