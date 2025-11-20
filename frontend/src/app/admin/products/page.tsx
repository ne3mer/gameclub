'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_BASE_URL, adminHeaders, ADMIN_API_KEY } from '@/lib/api';
import { ProductRow } from '@/types/admin';

const parseList = (value: string) =>
  value.split(',').map((entry) => entry.trim()).filter(Boolean);

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/games`);
      if (!response.ok) {
        throw new Error('خطا در دریافت لیست بازی‌ها');
      }
      const json = await response.json();
      setProducts(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'دریافت اطلاعات با مشکل مواجه شد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateProductDraft = (id: string, field: keyof ProductRow, value: string | boolean) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== id) return product;
        if (field === 'basePrice') {
          return { ...product, basePrice: Number(value) };
        }
        if (field === 'regionOptions' || field === 'tags' || field === 'genre') {
          return { ...product, [field]: parseList(String(value)) };
        }
        if (field === 'safeAccountAvailable') {
          return { ...product, safeAccountAvailable: Boolean(value) };
        }
        return { ...product, [field]: value as ProductRow[keyof ProductRow] };
      })
    );
  };

  const saveExistingProduct = async (productId: string) => {
    if (!ADMIN_API_KEY) {
      setStatusMessage('برای ویرایش لازم است کلید ادمین را تنظیم کنید.');
      return;
    }

    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const payload = {
      title: product.title,
      slug: product.slug,
      description: product.description,
      genre: product.genre,
      platform: product.platform,
      regionOptions: product.regionOptions,
      basePrice: product.basePrice,
      safeAccountAvailable: product.safeAccountAvailable,
      coverUrl: product.coverUrl,
      tags: product.tags
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('ویرایش محصول با مشکل مواجه شد');
      }
      setStatusMessage(`تغییرات ${product.title} ذخیره شد.`);
      await fetchProducts();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'خطا در ذخیره محصول');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!ADMIN_API_KEY) {
      setStatusMessage('کلید ادمین تعریف نشده است.');
      return;
    }

    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`, {
        method: 'DELETE',
        headers: adminHeaders()
      });
      if (!response.ok) {
        throw new Error('حذف محصول انجام نشد');
      }
      setStatusMessage('محصول حذف شد.');
      await fetchProducts();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'خطا در حذف محصول');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">لیست محصولات</h1>
          <p className="text-sm text-slate-500">مدیریت و ویرایش محصولات موجود</p>
        </div>
        <button
          onClick={fetchProducts}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          بروزرسانی لیست
        </button>
      </header>

      {statusMessage && (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {statusMessage}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="grid gap-4 md:grid-cols-12">
                {/* Basic Info */}
                <div className="md:col-span-4 space-y-3">
                  <label className="block">
                    <span className="text-xs text-slate-500">نام محصول</span>
                    <input
                      value={product.title}
                      onChange={(e) => updateProductDraft(product.id, 'title', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-500">اسلاگ</span>
                    <input
                      value={product.slug}
                      onChange={(e) => updateProductDraft(product.id, 'slug', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                    />
                  </label>
                </div>

                {/* Details */}
                <div className="md:col-span-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs text-slate-500">قیمت پایه</span>
                      <input
                        type="number"
                        value={product.basePrice}
                        onChange={(e) => updateProductDraft(product.id, 'basePrice', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-slate-500">پلتفرم</span>
                      <input
                        value={product.platform}
                        onChange={(e) => updateProductDraft(product.id, 'platform', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs text-slate-500">مناطق (با کاما)</span>
                    <input
                      value={product.regionOptions.join(', ')}
                      onChange={(e) => updateProductDraft(product.id, 'regionOptions', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                {/* Actions & Extra */}
                <div className="md:col-span-4 flex flex-col justify-between space-y-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={product.safeAccountAvailable}
                      onChange={(e) => updateProductDraft(product.id, 'safeAccountAvailable', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                    />
                    Safe Account موجود است
                  </label>
                  
                  <div className="flex gap-2 self-end">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-100"
                    >
                      ویرایش کامل
                    </Link>
                    <button
                      onClick={() => saveExistingProduct(product.id)}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                    >
                      ذخیره تغییرات
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              هنوز محصولی ثبت نشده است.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
