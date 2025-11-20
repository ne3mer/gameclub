'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import { ImageUpload } from '@/components/upload/ImageUpload';
import type { NewProductState, ProductRow } from '@/types/admin';

const RichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor').then((mod) => ({ default: mod.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-slate-200 p-4 text-center text-slate-500">در حال بارگذاری ویرایشگر...</div>
    )
  }
);

const parseList = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

type EditableProductState = NewProductState & { detailedDescription: string };

type StatusState = {
  type: 'success' | 'error';
  message: string;
} | null;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params?.id;
  const [formState, setFormState] = useState<EditableProductState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);

  const loadProduct = useCallback(async (silent = false) => {
    if (!productId) return;
    if (!silent) {
      setLoading(true);
      setStatus(null);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`);
      if (!response.ok) {
        throw new Error('دریافت اطلاعات محصول با خطا مواجه شد.');
      }
      const json = await response.json();
      const product: ProductRow | undefined = json?.data;
      if (!product) {
        throw new Error('محصول مورد نظر یافت نشد.');
      }

      setFormState({
        title: product.title ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        detailedDescription: product.detailedDescription ?? '',
        genre: product.genre?.join(', ') ?? '',
        platform: product.platform ?? '',
        regionOptions: product.regionOptions?.join(', ') ?? '',
        basePrice: product.basePrice != null ? String(product.basePrice) : '',
        safeAccountAvailable: Boolean(product.safeAccountAvailable),
        coverUrl: product.coverUrl ?? '',
        gallery: product.gallery ?? [],
        tags: product.tags?.join(', ') ?? '',
        options: product.options ?? [],
        variants: product.variants ?? []
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'بروزرسانی محصول ممکن نیست.'
      });
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleFieldChange = (field: keyof EditableProductState, value: string | boolean) => {
    setFormState((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleGalleryChange = (value: string) => {
    setFormState((prev) => (prev ? { ...prev, gallery: parseList(value) } : prev));
  };

  const handleOptionNameChange = (id: string, name: string) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            options: prev.options.map((opt) => (opt.id === id ? { ...opt, name } : opt))
          }
        : prev
    );
  };

  const handleOptionValuesChange = (id: string, valuesStr: string) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            options: prev.options.map((opt) =>
              opt.id === id ? { ...opt, values: parseList(valuesStr) } : opt
            )
          }
        : prev
    );
  };

  const handleAddOption = () => {
    setFormState((prev) =>
      prev ? { ...prev, options: [...prev.options, { id: crypto.randomUUID(), name: '', values: [] }] } : prev
    );
  };

  const handleRemoveOption = (id: string) => {
    setFormState((prev) =>
      prev ? { ...prev, options: prev.options.filter((opt) => opt.id !== id) } : prev
    );
  };

  const handleVariantChange = (id: string, field: 'price' | 'stock', value: number) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            variants: prev.variants.map((variant) =>
              variant.id === id ? { ...variant, [field]: value } : variant
            )
          }
        : prev
    );
  };

  const generateVariants = () => {
    setFormState((prev) => {
      if (!prev || !prev.options.length) return prev;

      const generateCombinations = (optionIndex: number, current: Record<string, string>): Record<string, string>[] => {
        if (optionIndex === prev.options.length) {
          return [current];
        }

        const option = prev.options[optionIndex];
        if (!option || !option.values.length || !option.name) {
          return [];
        }

        const combinations: Record<string, string>[] = [];
        for (const value of option.values) {
          combinations.push(
            ...generateCombinations(optionIndex + 1, {
              ...current,
              [option.name]: value
            })
          );
        }

        return combinations;
      };

      const combinations = generateCombinations(0, {});
      if (!combinations.length) {
        return prev;
      }

      const basePrice = Number(prev.basePrice) || 0;

      return {
        ...prev,
        variants: combinations.map((combo) => ({
          id: crypto.randomUUID(),
          selectedOptions: combo,
          price: basePrice,
          stock: 10
        }))
      };
    });
  };

  const handleSaveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState) return;

    if (!ADMIN_API_KEY) {
      setStatus({
        type: 'error',
        message: 'لطفاً NEXT_PUBLIC_ADMIN_API_KEY را برای ویرایش تنظیم کنید.'
      });
      return;
    }

    const priceNum = Number(formState.basePrice);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setStatus({
        type: 'error',
        message: 'قیمت باید یک عدد معتبر باشد.'
      });
      return;
    }

    setSaving(true);
    setStatus(null);

    const payload = {
      title: formState.title,
      slug: formState.slug,
      description: formState.description,
      detailedDescription: formState.detailedDescription || undefined,
      genre: parseList(formState.genre),
      platform: formState.platform,
      regionOptions: parseList(formState.regionOptions),
      basePrice: priceNum,
      safeAccountAvailable: formState.safeAccountAvailable,
      coverUrl: formState.coverUrl || undefined,
      gallery: formState.gallery,
      tags: parseList(formState.tags),
      options: formState.options,
      variants: formState.variants
    };

    if (!productId) {
      setStatus({
        type: 'error',
        message: 'شناسه محصول معتبر نیست.'
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'ذخیره تغییرات با خطا مواجه شد.');
      }

      setStatus({
        type: 'success',
        message: 'تغییرات محصول با موفقیت ذخیره شد.'
      });
      await loadProduct(true);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'ذخیره تغییرات ممکن نیست.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!ADMIN_API_KEY) {
      setStatus({
        type: 'error',
        message: 'برای حذف محصول باید کلید ادمین را تنظیم کنید.'
      });
      return;
    }

    if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;

    if (!productId) {
      setStatus({
        type: 'error',
        message: 'شناسه محصول معتبر نیست.'
      });
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`, {
        method: 'DELETE',
        headers: adminHeaders()
      });

      if (!response.ok) {
        throw new Error('حذف محصول با مشکل مواجه شد.');
      }

      setStatus({
        type: 'success',
        message: 'محصول حذف شد.'
      });
      router.push('/admin/products');
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'حذف محصول ممکن نیست.'
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        در حال بارگذاری اطلاعات محصول...
      </div>
    );
  }

  if (!formState) {
    return (
      <div className="space-y-4">
        {status && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {status.message}
          </div>
        )}
        <button
          onClick={() => loadProduct()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          تلاش مجدد برای بارگذاری
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ویرایش محصول</h1>
          <p className="text-sm text-slate-500">ویرایش کامل مشخصات {formState.title}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            بازگشت به لیست
          </button>
          <button
            type="button"
            onClick={handleDeleteProduct}
            disabled={deleting}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-70"
          >
            {deleting ? 'در حال حذف...' : 'حذف محصول'}
          </button>
        </div>
      </header>

      {status && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSaveProduct} className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <label>
          <span className="text-sm font-bold text-slate-700">نام بازی</span>
          <input
            value={formState.title}
            onChange={(event) => handleFieldChange('title', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            required
          />
        </label>
        <label>
          <span className="text-sm font-bold text-slate-700">اسلاگ (URL)</span>
          <input
            value={formState.slug}
            onChange={(event) => handleFieldChange('slug', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono"
            required
          />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-700">توضیحات کوتاه</span>
          <textarea
            value={formState.description}
            onChange={(event) => handleFieldChange('description', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            rows={3}
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <label>
            <span className="text-sm font-bold text-slate-700">ژانرها (با کاما)</span>
            <input
              value={formState.genre}
              onChange={(event) => handleFieldChange('genre', event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
          <label>
            <span className="text-sm font-bold text-slate-700">پلتفرم</span>
            <input
              value={formState.platform}
              onChange={(event) => handleFieldChange('platform', event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <label>
            <span className="text-sm font-bold text-slate-700">قیمت پایه (تومان)</span>
            <input
              type="number"
              value={formState.basePrice}
              onChange={(event) => handleFieldChange('basePrice', event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
          </label>
          <label>
            <span className="text-sm font-bold text-slate-700">مناطق (R1, R2 ...)</span>
            <input
              value={formState.regionOptions}
              onChange={(event) => handleFieldChange('regionOptions', event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="md:col-span-2">
          <ImageUpload
            currentImage={formState.coverUrl}
            onImageUploaded={(url) => handleFieldChange('coverUrl', url)}
            label="تصویر کاور محصول"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">توضیحات کامل محصول (Rich Text)</label>
          <RichTextEditor content={formState.detailedDescription} onChange={(value) => handleFieldChange('detailedDescription', value)} />
          <p className="mt-2 text-xs text-slate-500">تمام جزئیات، تصاویر و لینک‌ها را می‌توانید ویرایش کنید.</p>
        </div>

        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-700">تگ‌ها (با کاما)</span>
          <input
            value={formState.tags}
            onChange={(event) => handleFieldChange('tags', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </label>

        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-700">گالری تصاویر (با کاما)</span>
          <input
            value={formState.gallery.join(', ')}
            onChange={(event) => handleGalleryChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="https://example.com/image-1.webp, https://example.com/image-2.webp"
          />
        </label>

        <div className="md:col-span-2 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">ویژگی‌های محصول (Options)</h3>
            <button
              type="button"
              onClick={handleAddOption}
              className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              + افزودن ویژگی
            </button>
          </div>

          {formState.options.map((opt) => (
            <div key={opt.id} className="grid gap-4 md:grid-cols-2 rounded-xl bg-white border border-slate-200 p-4">
              <label>
                <span className="text-xs text-slate-500">نام ویژگی</span>
                <input
                  value={opt.name}
                  onChange={(e) => handleOptionNameChange(opt.id, e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Platform"
                />
              </label>
              <div className="flex items-end gap-2">
                <label className="flex-1">
                  <span className="text-xs text-slate-500">مقادیر (با کاما)</span>
                  <input
                    value={opt.values.join(', ')}
                    onChange={(e) => handleOptionValuesChange(opt.id, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="PS4, PS5"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(opt.id)}
                  className="mb-1 rounded-lg bg-rose-50 p-2 text-rose-500 hover:bg-rose-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {formState.options.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">انواع محصول (Variants)</h3>
                <button
                  type="button"
                  onClick={generateVariants}
                  className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
                >
                  تولید خودکار انواع
                </button>
              </div>

              {formState.variants.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th className="p-3 text-right">ترکیب</th>
                        <th className="p-3 text-right">قیمت</th>
                        <th className="p-3 text-right">موجودی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formState.variants.map((variant) => (
                        <tr key={variant.id}>
                          <td className="p-3 font-mono text-right" dir="ltr">
                            {Object.entries(variant.selectedOptions)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ')}
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(variant.id, 'price', Number(e.target.value))}
                              className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(variant.id, 'stock', Number(e.target.value))}
                              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={formState.safeAccountAvailable}
            onChange={(event) => handleFieldChange('safeAccountAvailable', event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
          />
          Safe Account موجود است
        </label>

        <div className="md:col-span-2 pt-4 space-y-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 hover:shadow-emerald-500/30 disabled:opacity-70"
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات محصول'}
          </button>
        </div>
      </form>
    </div>
  );
}
