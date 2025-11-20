import { categories } from '@/data/home';

export const CategoriesSection = () => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-emerald-600">برای هر نوع گیمر</p>
        <h2 className="text-2xl font-semibold text-slate-900">دسته‌بندی و پیشنهادهای سریع</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <article
            key={category.id}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
          >
            <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{category.description}</p>
            <button className="mt-4 text-sm font-semibold text-emerald-600">مشاهده بازی‌ها →</button>
          </article>
        ))}
      </div>
    </section>
  );
};
