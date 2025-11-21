export const HeroSection = () => {
  return (
    <section className="rounded-[40px] border border-[#e5e5ea] bg-gradient-to-br from-white via-[#f8f8fb] to-white px-8 py-14 text-slate-900 shadow-[0_35px_110px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold text-[#0a84ff]">GameClub Iran</p>
      <h1 className="mt-4 text-3xl font-black leading-snug text-slate-900 md:text-4xl">
        خرید اکانت قانونی PS5 با تحویل فوری و گارانتی تعویض
      </h1>
      <p className="mt-3 text-base text-slate-600">
        پرداخت ریالی، تحویل کمتر از ۳۰ ثانیه بعد از پرداخت + پشتیبانی تلگرام برای نصب.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-2xl bg-[#0a84ff] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0071e3]">
          مشاهده بازی‌ها
        </button>
        <button className="rounded-2xl border border-[#d1d1d6] px-6 py-3 text-sm font-bold text-slate-700 hover:border-[#0a84ff]/40 hover:text-[#0a84ff] transition">
          عضویت Game Club
        </button>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 text-right text-sm md:grid-cols-4">
        {[
          { label: 'سفارش موفق', value: '۴۵۰۰+' },
          { label: 'زمان تحویل', value: '< ۳۰ ثانیه' },
          { label: 'گارانتی تعویض', value: '۷ روز' },
          { label: 'حالت اکانت', value: 'Safe & استاندارد' }
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#e5e5ea] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#0a84ff]">{item.label}</p>
            <p className="text-lg font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
