const genres = [
  { id: 'action', label: 'اکشن' },
  { id: 'sports', label: 'ورزشی' },
  { id: 'story', label: 'داستان محور' }
];

const regions = ['R1', 'R2', 'TR'];

export const GameFilters = () => {
  return (
    <aside className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">فیلتر سریع</h3>
      <div className="mt-4 space-y-4 text-sm">
        <div>
          <p className="font-semibold text-slate-700">ژانر</p>
          <div className="mt-2 space-y-2">
            {genres.map((genre) => (
              <label key={genre.id} className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="accent-emerald-500" />
                {genre.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-slate-700">Region</p>
          <div className="mt-2 space-y-2">
            {regions.map((region) => (
              <label key={region} className="flex items-center gap-2 text-slate-600">
                <input type="radio" name="region" className="accent-emerald-500" />
                {region}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-slate-700">وضعیت اکانت</p>
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="accent-emerald-500" />
            Safe فقط
          </label>
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="accent-emerald-500" />
            آفلاین قابل اجرا
          </label>
        </div>
        <div>
          <p className="font-semibold text-slate-700">بازه قیمت (تومان)</p>
          <div className="mt-2 flex items-center gap-3">
            <input type="range" min="500000" max="3500000" className="w-full accent-emerald-500" />
          </div>
          <p className="text-xs text-slate-500">حداکثر ۲,۵۰۰,۰۰۰ تومان</p>
        </div>
        <button className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white">اعمال فیلتر</button>
      </div>
    </aside>
  );
};
