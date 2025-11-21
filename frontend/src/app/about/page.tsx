'use client';

import { Icon } from '@/components/icons/Icon';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                درباره ما
              </span>
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-slate-900 md:text-7xl">
              گیم کلاب ایران
            </h1>
            
            <p className="mt-6 text-xl text-slate-600 leading-relaxed">
              بزرگترین و معتبرترین فروشگاه آنلاین بازی‌های دیجیتال در ایران
            </p>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -z-10 h-[400px] w-[400px] translate-x-1/3 -translate-y-1/4 rounded-full bg-gradient-to-br from-emerald-50 to-blue-50 blur-3xl opacity-60" />
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: 'rocket',
                title: 'ماموریت ما',
                description: 'ارائه بهترین تجربه خرید بازی‌های دیجیتال با قیمت‌های رقابتی و خدمات پس از فروش عالی'
              },
              {
                icon: 'eye',
                title: 'چشم‌انداز',
                description: 'تبدیل شدن به اولین انتخاب گیمرهای ایرانی برای خرید بازی‌های دیجیتال و محتوای گیمینگ'
              },
              {
                icon: 'heart',
                title: 'ارزش‌های ما',
                description: 'اعتماد، شفافیت، کیفیت و پشتیبانی از جامعه گیمرهای ایران'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group rounded-3xl border border-slate-100 bg-white p-8 transition hover:shadow-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                  <Icon name={item.icon as any} size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-8">
            <div>
              <h2 className="mb-6 text-4xl font-black text-slate-900">داستان ما</h2>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                <p>
                  گیم کلاب ایران در سال ۱۴۰۰ با هدف ارائه راهکاری آسان و مطمئن برای خرید بازی‌های دیجیتال به گیمرهای ایرانی تاسیس شد. ما می‌دانستیم که دسترسی به بازی‌های اورجینال و قانونی برای بسیاری از علاقه‌مندان به بازی‌های ویدیویی چالش‌برانگیز است.
                </p>
                <p>
                  با تیمی متشکل از گیمرهای حرفه‌ای و متخصصان فناوری، توانستیم پلتفرمی ایجاد کنیم که نه تنها دسترسی آسان به هزاران بازی را فراهم می‌کند، بلکه با قیمت‌گذاری منصفانه و پشتیبانی ۲۴ساعته، تجربه‌ای بی‌نظیر برای کاربران خود رقم می‌زند.
                </p>
                <p>
                  امروز، با افتخار خدمت‌رسانی به بیش از ۵۰,۰۰۰ گیمر ایرانی را داریم و همچنان در تلاشیم تا بهترین باشیم.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-8 md:grid-cols-4">
              {[
                { label: 'کاربران فعال', value: '۵۰,۰۰۰+' },
                { label: 'بازی موجود', value: '۲,۵۰۰+' },
                { label: 'سفارش تکمیل شده', value: '۱۰۰,۰۰۰+' },
                { label: 'رضایت مشتریان', value: '۹۸٪' }
              ].map((stat, index) => (
                <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
                  <p className="text-3xl font-black text-emerald-500">{stat.value}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-4xl font-black text-slate-900">چرا گیم کلاب؟</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: 'shield', title: 'خرید امن', description: 'تمامی تراکنش‌ها با بالاترین استانداردهای امنیتی' },
              { icon: 'zap', title: 'تحویل فوری', description: 'دریافت کد بازی بلافاصله پس از پرداخت' },
              { icon: 'dollar', title: 'قیمت رقابتی', description: 'بهترین قیمت‌ها در بازار ایران' },
              { icon: 'message', title: 'پشتیبانی ۲۴/۷', description: 'تیم پشتیبانی همیشه در کنار شما' },
              { icon: 'gift', title: 'تخفیف‌های ویژه', description: 'تخفیف‌های منحصر به فرد برای کاربران وفادار' },
              { icon: 'check', title: 'ضمانت اصالت', description: 'تضمین اورجینال بودن تمامی محصولات' }
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-100 bg-white p-6 transition hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name={feature.icon as any} size={20} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-500 to-emerald-600">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-4xl font-black text-white">
            آماده شروع هستید؟
          </h2>
          <p className="mb-8 text-xl text-emerald-50">
            به جمع هزاران گیمر راضی بپیوندید و تجربه خرید بی‌نظیر را تجربه کنید
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/games"
              className="rounded-2xl bg-white px-8 py-4 text-base font-bold text-emerald-600 shadow-lg transition hover:scale-105"
            >
              مشاهده کاتالوگ بازی‌ها
            </Link>
            <Link
              href="/register"
              className="rounded-2xl border-2 border-white px-8 py-4 text-base font-bold text-white transition hover:bg-white/10"
            >
              ثبت‌نام رایگان
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
