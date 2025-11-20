export type HeroStat = {
  id: string;
  label: string;
  value: string;
};

export type HeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: HeroStat[];
};

export type Spotlight = {
  id: string;
  title: string;
  description: string;
  href: string;
  accent: 'emerald' | 'indigo' | 'slate' | string;
};

export type TrustSignal = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type Testimonial = {
  id: string;
  name: string;
  handle: string;
  text: string;
  avatar: string;
  highlight?: boolean;
};

export type HomeContent = {
  hero: HeroContent;
  spotlights: Spotlight[];
  trustSignals: TrustSignal[];
  testimonials: Testimonial[];
};

export const defaultHomeContent: HomeContent = {
  hero: {
    badge: 'GameClub Exclusive',
    title: 'با GameClub هر ماه بازی پریمیوم داشته باش',
    subtitle: 'تحویل لحظه‌ای، گارانتی تعویض و پشتیبانی فارسی برای هر خرید',
    primaryCta: { label: 'مشاهده بازی‌ها', href: '/games' },
    secondaryCta: { label: 'عضویت GameClub', href: '/account' },
    stats: [
      { id: 'orders', label: 'سفارش موفق', value: '۴۵۰۰+' },
      { id: 'delivery', label: 'زمان تحویل', value: '< ۳۰ ثانیه' },
      { id: 'guarantee', label: 'گارانتی تعویض', value: '۷ روز' },
      { id: 'mode', label: 'حالت اکانت', value: 'Safe & استاندارد' }
    ]
  },
  spotlights: [
    {
      id: 'cta-1',
      title: 'ربات تلگرام تحویل آنی',
      description: 'سفارش دهید و اطلاعات اکانت را زیر ۳۰ ثانیه تحویل بگیرید.',
      href: 'https://t.me/GameClubSupportBot',
      accent: 'emerald'
    },
    {
      id: 'cta-2',
      title: 'پلن وفاداری GameClub',
      description: 'با هر خرید ۱۰٪ شارژ وفاداری و تخفیف Safe دریافت کنید.',
      href: '/account',
      accent: 'indigo'
    },
    {
      id: 'cta-3',
      title: 'پشتیبانی تخصصی PS5',
      description: 'تیم فارسی‌زبان برای نصب، فعال‌سازی و رفع مسدودیت کنار شماست.',
      href: '/support',
      accent: 'slate'
    }
  ],
  trustSignals: [
    { id: 'trust-1', title: 'گارانتی ۷ روزه', description: 'در صورت هرگونه مشکل، حساب جدید دریافت می‌کنید.', icon: '🛡️' },
    { id: 'trust-2', title: '۱۰۰٪ قانونی', description: 'تمامی اکانت‌ها از منابع معتبر و سازگار با قوانین PSN تهیه می‌شوند.', icon: '✅' },
    { id: 'trust-3', title: 'تحویل لحظه‌ای', description: 'اتوماسیون GameClub سفارش را مستقیم به تلگرام شما می‌فرستد.', icon: '⚡' },
    { id: 'trust-4', title: 'پشتیبانی ۲۴/۷', description: 'در هر ساعت از شبانه‌روز با تلگرام یا ایمیل پاسخگو هستیم.', icon: '💬' }
  ],
  testimonials: [
    {
      id: 'test-1',
      name: 'عرفان از شیراز',
      handle: '@erfanplays',
      text: 'کمتر از ۵ دقیقه فعال‌سازی انجام شد و تیم پشتیبانی تمام مراحل کنارم بود.',
      avatar: 'https://i.pravatar.cc/100?img=15',
      highlight: true
    },
    {
      id: 'test-2',
      name: 'فاطمه از تهران',
      handle: '@fatima.gg',
      text: 'گارانتی تعویض واقعاً عملیه؛ برای دوستانم هم سفارش دادم و همه راضی بودند.',
      avatar: 'https://i.pravatar.cc/100?img=45',
      highlight: false
    },
    {
      id: 'test-3',
      name: 'امیرحسین از تبریز',
      handle: '@amirplays',
      text: 'قیمت‌ها از همه جا پایین‌تر بود و راهنمای ضد بن باعث شد مطمئن باشم.',
      avatar: 'https://i.pravatar.cc/100?img=12',
      highlight: false
    }
  ]
};
