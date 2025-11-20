export const HeroSection = () => {
  return (
    <section className="rounded-[40px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 px-8 py-14 text-white shadow-2xl">
      <p className="text-sm text-emerald-200">GameClub Iran</p>
      <h1 className="mt-4 text-3xl font-black leading-snug md:text-4xl">
        خرید اکانت قانونی PS5 با تحویل فوری و گارانتی تعویض
      </h1>
      <p className="mt-3 text-base text-slate-100">
        پرداخت ریالی، تحویل کمتر از ۳۰ ثانیه بعد از پرداخت + پشتیبانی تلگرام برای نصب.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900">
          مشاهده بازی‌ها
        </button>
        <button className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-bold text-white">
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
          <div key={item.label} className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-emerald-200">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
