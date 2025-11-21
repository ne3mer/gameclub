'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { toast } from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  productCount: number;
  isActive: boolean;
  showOnHome: boolean;
  order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      toast.error('خطا در دریافت دسته‌بندی‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
        }
      });

      if (res.ok) {
        toast.success('دسته‌بندی با موفقیت حذف شد');
        fetchCategories();
      } else {
        toast.error('خطا در حذف دسته‌بندی');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const handleReorder = async (newCategories: Category[]) => {
    // Optimistic update
    setCategories(newCategories);

    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/api/categories/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
        },
        body: JSON.stringify({
          categories: newCategories.map((c, index) => ({
            id: c._id,
            order: index
          }))
        })
      });
    } catch (error) {
      toast.error('خطا در ذخیره ترتیب');
      fetchCategories(); // Revert on error
    }
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    if (direction === 'up' && index > 0) {
      [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
    } else if (direction === 'down' && index < newCategories.length - 1) {
      [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    }
    handleReorder(newCategories);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">دسته‌بندی‌ها</h1>
          <p className="mt-1 text-sm text-slate-500">مدیریت دسته‌بندی‌های محصولات</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600"
        >
          <Icon name="plus" size={20} />
          <span>دسته‌بندی جدید</span>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">ترتیب</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">نام</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">اسلاگ</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">محصولات</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">وضعیت</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category, index) => (
              <tr key={category._id} className="group hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveCategory(index, 'up')}
                      disabled={index === 0}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-30"
                    >
                      <Icon name="chevron-up" size={16} />
                    </button>
                    <button
                      onClick={() => moveCategory(index, 'down')}
                      disabled={index === categories.length - 1}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-30"
                    >
                      <Icon name="chevron-down" size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <div className="font-bold text-slate-900">{category.name}</div>
                      <div className="text-xs text-slate-500">{category.nameEn}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600" dir="ltr">
                  {category.slug}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    {category.productCount} محصول
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      category.isActive 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {category.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                    {category.showOnHome && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        صفحه اصلی
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/categories/${category._id}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Icon name="edit" size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  هنوز هیچ دسته‌بندی ایجاد نشده است
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
