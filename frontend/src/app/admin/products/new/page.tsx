'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, adminHeaders, ADMIN_API_KEY } from '@/lib/api';
import { NewProductState, initialNewProduct } from '@/types/admin';
import { ImageUpload } from '@/components/upload/ImageUpload';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor').then(mod => ({ default: mod.RichTextEditor })), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-slate-200 p-4 text-center text-slate-500">در حال بارگذاری ویرایشگر...</div>
});

const parseList = (value: string) =>
  value.split(',').map((entry) => entry.trim()).filter(Boolean);

export default function NewProductPage() {
  const router = useRouter();
  const [newProduct, setNewProduct] = useState<NewProductState>(initialNewProduct);
  const [detailedDescription, setDetailedDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleNewProductChange = (field: keyof NewProductState, value: string | boolean) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddOption = () => {
    setNewProduct((prev) => ({
      ...prev,
      options: [...prev.options, { id: crypto.randomUUID(), name: '', values: [] }]
    }));
  };

  const handleRemoveOption = (id: string) => {
    setNewProduct((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id)
    }));
  };

  const handleOptionNameChange = (id: string, name: string) => {
    setNewProduct((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.id === id ? { ...opt, name } : opt))
    }));
  };

  const handleOptionValuesChange = (id: string, valuesStr: string) => {
    setNewProduct((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.id === id ? { ...opt, values: parseList(valuesStr) } : opt))
    }));
  };

  const generateVariants = () => {
    if (newProduct.options.length === 0) return;

    const generateCombinations = (optionIndex: number, current: Record<string, string>): Record<string, string>[] => {
      if (optionIndex === newProduct.options.length) return [current];

      const option = newProduct.options[optionIndex];
      const combinations: Record<string, string>[] = [];

      for (const value of option.values) {
        combinations.push(...generateCombinations(optionIndex + 1, { ...current, [option.name]: value }));
      }

      return combinations;
    };

    const combinations = generateCombinations(0, {});
    const basePrice = Number(newProduct.basePrice) || 0;

    const newVariants = combinations.map((combo) => ({
      id: crypto.randomUUID(),
      selectedOptions: combo,
      price: basePrice,
      stock: 10
    }));

    setNewProduct((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleVariantChange = (id: string, field: 'price' | 'stock', value: number) => {
    setNewProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    }));
  };

  const handleCreateNewProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ADMIN_API_KEY) {
      setStatusMessage('لطفاً NEXT_PUBLIC_ADMIN_API_KEY تنظیم شود.');
      return;
    }

    const priceNum = Number(newProduct.basePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setStatusMessage('قیمت باید یک عدد مثبت باشد.');
      return;
    }

    setLoading(true);
    setStatusMessage('');

    const payload = {
      title: newProduct.title,
      slug: newProduct.slug,
      description: newProduct.description,
      detailedDescription: detailedDescription || undefined,
      genre: parseList(newProduct.genre),
      platform: newProduct.platform,
      regionOptions: parseList(newProduct.regionOptions),
      basePrice: priceNum,
      safeAccountAvailable: newProduct.safeAccountAvailable,
      coverUrl: newProduct.coverUrl || undefined,
      tags: parseList(newProduct.tags),
      options: newProduct.options,
      variants: newProduct.variants
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/games`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'ساخت محصول جدید موفق نبود');
      }
      setStatusMessage('محصول جدید با موفقیت ثبت شد.');
      setNewProduct(initialNewProduct);
      setDetailedDescription('');
      // Optionally redirect to product list
      // router.push('/admin/products');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'خطا در ایجاد محصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">افزودن محصول جدید</h1>
        <p className="text-sm text-slate-500">مشخصات محصول جدید را وارد کنید</p>
      </header>

      {statusMessage && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${statusMessage.includes('موفق') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleCreateNewProduct} className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <label>
          <span className="text-sm font-bold text-slate-700">نام بازی</span>
          <input
            value={newProduct.title}
            onChange={(event) => handleNewProductChange('title', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            required
          />
        </label>
        <label>
          <span className="text-sm font-bold text-slate-700">اسلاگ (URL)</span>
          <input
            value={newProduct.slug}
            onChange={(event) => handleNewProductChange('slug', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono"
            required
          />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-700">توضیحات</span>
          <textarea
            value={newProduct.description}
            onChange={(event) => handleNewProductChange('description', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            rows={4}
            required
          />
        </label>
        
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <label>
            <span className="text-sm font-bold text-slate-700">ژانرها (با کاما)</span>
            <input
                value={newProduct.genre}
                onChange={(event) => handleNewProductChange('genre', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            </label>
            <label>
            <span className="text-sm font-bold text-slate-700">پلتفرم</span>
            <input
                value={newProduct.platform}
                onChange={(event) => handleNewProductChange('platform', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            </label>
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <label>
            <span className="text-sm font-bold text-slate-700">قیمت پایه (تومان)</span>
            <input
                type="number"
                value={newProduct.basePrice}
                onChange={(event) => handleNewProductChange('basePrice', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                required
            />
            </label>
            <label>
            <span className="text-sm font-bold text-slate-700">مناطق (R1, R2...)</span>
            <input
                value={newProduct.regionOptions}
                onChange={(event) => handleNewProductChange('regionOptions', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            </label>
        </div>

        <div className="md:col-span-2">
          <ImageUpload
            currentImage={newProduct.coverUrl}
            onImageUploaded={(url) => handleNewProductChange('coverUrl', url)}
            label="تصویر کاور محصول"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">توضیحات کامل محصول (Rich Text)</label>
          <RichTextEditor
            content={detailedDescription}
            onChange={setDetailedDescription}
          />
          <p className="mt-2 text-xs text-slate-500">
            می‌توانید متن را فرمت‌بندی کنید، تصویر و لینک اضافه کنید
          </p>
        </div>

        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-700">تگ‌ها (با کاما)</span>
          <input
            value={newProduct.tags}
            onChange={(event) => handleNewProductChange('tags', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </label>

        {/* Options & Variants Section */}
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

            {newProduct.options.map((opt) => (
            <div key={opt.id} className="grid gap-4 md:grid-cols-2 rounded-xl bg-white border border-slate-200 p-4">
                <label>
                <span className="text-xs text-slate-500">نام ویژگی (مثلاً Platform)</span>
                <input
                    value={opt.name}
                    onChange={(e) => handleOptionNameChange(opt.id, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Platform"
                />
                </label>
                <div className="flex items-end gap-2">
                <label className="flex-1">
                    <span className="text-xs text-slate-500">مقادیر (با کاما: PS4, PS5)</span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                </div>
            </div>
            ))}

            {newProduct.options.length > 0 && (
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

                {newProduct.variants.length > 0 && (
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
                        {newProduct.variants.map((variant) => (
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
            checked={newProduct.safeAccountAvailable}
            onChange={(event) => handleNewProductChange('safeAccountAvailable', event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
          />
          Safe Account موجود است
        </label>

        <div className="md:col-span-2 pt-4">
            <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 hover:shadow-emerald-500/30 disabled:opacity-70"
            >
            {loading ? 'در حال ثبت...' : 'ثبت محصول جدید'}
            </button>
        </div>
      </form>
    </div>
  );
}
