import Link from 'next/link';
import Image from 'next/image';

export type CategoryHighlight = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  productCount?: number;
  showOnHome?: boolean;
};

type Props = {
  categories: CategoryHighlight[];
};

export const CategoriesSection = ({ categories }: Props) => {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 w-fit">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">دسته‌بندی‌ها</p>
        </div>
        <h2 className="text-3xl font-black text-slate-900">بازی مورد علاقه‌ات رو پیدا کن</h2>
        <p className="text-slate-600">دسته‌بندی و پیشنهادهای سریع برای هر نوع گیمر</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category, index) => {
          const href = category.slug ? `/categories/${category.slug}` : '/categories';
          const accents = [
            { gradient: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-200', hover: 'hover:border-purple-400' },
            { gradient: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-200', hover: 'hover:border-blue-400' },
            { gradient: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200', hover: 'hover:border-emerald-400' },
            { gradient: 'from-orange-500/10 to-red-500/10', border: 'border-orange-200', hover: 'hover:border-orange-400' }
          ];
          const accent = accents[index % accents.length];
          return (
          <article
            key={category.id}
            className={`group flex flex-col justify-between rounded-3xl border ${accent.border} bg-gradient-to-br ${accent.gradient} p-6 shadow-lg transition-all ${accent.hover} hover:shadow-2xl hover:-translate-y-1`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f6fa] text-2xl">
                  {category.icon || '🎮'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                  {typeof category.productCount === 'number' && (
                    <p className="text-xs text-slate-500">{category.productCount} بازی</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{category.description || 'انتخاب‌های منتخب برای این دسته.'}</p>
              {category.imageUrl && (
                <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-white/50 bg-white/50">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <div className="mt-5">
              <Link
                href={href}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#d1d1d6] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0a84ff]/40 hover:text-[#0a84ff]"
              >
                مشاهده بازی‌ها
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        );
        })}
      </div>
    </section>
  );
};
