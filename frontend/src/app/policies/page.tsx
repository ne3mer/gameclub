'use client';

import { Icon } from '@/components/icons/Icon';
import Link from 'next/link';

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <Icon name="file" size={14} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                قوانین و مقررات
              </span>
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
              سیاست‌ها و قوانین
            </h1>
            
            <p className="mt-6 text-lg text-slate-600">
              آخرین بروزرسانی: آذر ۱۴۰۳
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-12">
            
            {/* Privacy Policy */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="shield" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">حریم خصوصی</h2>
              </div>
              
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">جمع‌آوری اطلاعات</h3>
                  <p>
                    گیم کلاب ایران متعهد به حفظ حریم خصوصی کاربران خود است. اطلاعاتی که از شما جمع‌آوری می‌کنیم شامل نام، ایمیل، شماره تماس و اطلاعات پرداخت می‌شود. این اطلاعات صرفاً برای پردازش سفارشات و بهبود خدمات استفاده می‌شود.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">امنیت اطلاعات</h3>
                  <p>
                    تمامی اطلاعات شخصی شما با استفاده از پروتکل‌های امنیتی پیشرفته رمزنگاری و ذخیره می‌شود. ما هیچ‌گاه اطلاعات شما را با اشخاص ثالث به اشتراک نمی‌گذاریم مگر در موارد قانونی.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">کوکی‌ها</h3>
                  <p>
                    وب‌سایت ما از کوکی‌ها برای بهبود تجربه کاربری استفاده می‌کند. شما می‌توانید استفاده از کوکی‌ها را در تنظیمات مرورگر خود غیرفعال کنید.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="file" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">شرایط استفاده</h2>
              </div>
              
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">پذیرش شرایط</h3>
                  <p>
                    با استفاده از خدمات گیم کلاب ایران، شما تمامی شرایط و قوانین ذکر شده در این صفحه را می‌پذیرید. در صورت عدم موافقت با هر یک از این شرایط، لطفاً از خدمات ما استفاده نکنید.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">استفاده مجاز</h3>
                  <p>
                    شما موظف هستید از خدمات ما تنها برای اهداف قانونی استفاده کنید. هرگونه سوءاستفاده، کلاهبرداری یا فعالیت غیرقانونی منجر به مسدود شدن حساب کاربری شما خواهد شد.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">مالکیت معنوی</h3>
                  <p>
                    تمامی محتوای موجود در وب‌سایت گیم کلاب ایران، از جمله متن، تصاویر، لوگو و طراحی، متعلق به ما بوده و محافظت شده توسط قوانین مالکیت معنوی است.
                  </p>
                </div>
              </div>
            </div>

            {/* Return Policy */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Icon name="refresh" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">سیاست بازگشت و استرداد</h2>
              </div>
              
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">محصولات دیجیتال</h3>
                  <p>
                    با توجه به ماهیت دیجیتال محصولات، پس از تحویل کد بازی امکان بازگشت وجود ندارد. لطفاً قبل از خرید از صحت انتخاب خود اطمینان حاصل کنید.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">کد معیوب</h3>
                  <p>
                    در صورتی که کد دریافتی معیوب یا استفاده شده باشد، می‌توانید ظرف ۲۴ ساعت با پشتیبانی تماس بگیرید. پس از بررسی، کد جایگزین یا بازگشت وجه برای شما انجام خواهد شد.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">زمان بررسی</h3>
                  <p>
                    درخواست‌های استرداد وجه ظرف ۳ تا ۵ روز کاری بررسی می‌شود. در صورت تایید، وجه ظرف ۷ روز کاری به حساب شما بازگردانده خواهد شد.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Policy */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon name="credit-card" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">سیاست پرداخت</h2>
              </div>
              
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">روش‌های پرداخت</h3>
                  <p>
                    ما از تمامی کارت‌های بانکی عضو شتاب پشتیبانی می‌کنیم. همچنین امکان پرداخت از طریق کیف پول‌های دیجیتال نیز فراهم است.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">امنیت پرداخت</h3>
                  <p>
                    تمامی تراکنش‌ها از طریق درگاه‌های پرداخت معتبر و با رمزنگاری SSL انجام می‌شود. ما هیچ‌گاه اطلاعات کارت بانکی شما را ذخیره نمی‌کنیم.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">قیمت‌گذاری</h3>
                  <p>
                    تمامی قیمت‌ها به تومان بوده و شامل مالیات بر ارزش افزوده می‌باشد. قیمت‌ها ممکن است بدون اطلاع قبلی تغییر کنند.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <Icon name="message" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">سوالی دارید؟</h2>
              </div>
              
              <p className="mb-6 text-slate-600 leading-relaxed">
                اگر سوال یا ابهامی در مورد قوانین و سیاست‌های ما دارید، تیم پشتیبانی ما آماده پاسخگویی به شما است.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/account"
                  className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
                >
                  تماس با پشتیبانی
                </Link>
                <Link
                  href="/about"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  درباره ما
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
