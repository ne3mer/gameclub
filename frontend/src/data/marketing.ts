export type BannerContent = {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  perks: string[];
  priceLabel: string;
  priceValue: string;
  ctaLabel: string;
  ctaHref: string;
};

export const defaultBannerContent: BannerContent = {
  title: 'Game Club Banner 1403',
  subtitle: 'Creative Drop',
  badge: 'تحویل ۳۰ ثانیه‌ای',
  description:
    'با عضویت در Game Club می‌توانید هر ماه ۳ اکانت Safe را با قیمت ویژه دریافت کنید و در اولویت پشتیبانی تلگرام قرار بگیرید. این بنر تعاملی وسط صفحات کاتالوگ/اکانت طراحی شده تا تبدیل را افزایش دهد.',
  perks: ['تحویل ۳۰ ثانیه‌ای', '۴ بازی پریمیوم در ماه', 'پشتیبانی ۲۴/۷'],
  priceLabel: 'Game Club Plan',
  priceValue: '۴۹۹ هزار تومان',
  ctaLabel: 'فعالسازی اشتراک',
  ctaHref: '/account'
};
