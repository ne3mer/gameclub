export type GameDetail = {
  id: string;
  slug: string;
  title: string;
  platform: string;
  price: number;
  safePrice?: number;
  region: string;
  isSafe: boolean;
  rating: number;
  genre: string;
  description: string;
  tags: string[];
  features: string[];
  approxPlaytime: string;
  offline: boolean;
  online: boolean;
  sharedType: 'اصلی' | 'اشتراکی';
  cover: string;
  gallery: string[];
  guarantee: string[];
  activationSteps: string[];
};

export type Review = {
  id: number;
  user: string;
  handle: string;
  rating: number;
  text: string;
  avatar: string;
};

export const catalogGames: GameDetail[] = [
  {
    id: 'gow-ragnarok',
    slug: 'god-of-war-ragnarok',
    title: 'God of War Ragnarök',
    platform: 'PS5',
    price: 2499000,
    safePrice: 2899000,
    region: 'R2',
    isSafe: true,
    rating: 4.9,
    genre: 'action',
    description:
      'جدیدترین ماجراجویی کریتوس و آترئوس با پشتیبانی کامل از دوبله فارسی منو و گیم‌پلی سینمایی. مناسب برای بازیکنان داستان‌محور که دنبال تجربه سینماتیک هستند.',
    tags: ['داستانی', 'اکشن', 'Safe Account'],
    features: ['گرافیک نسل نهم', 'DualSense Haptics', 'پشتیبانی از Performance Mode'],
    approxPlaytime: '۴۵ تا ۵۰ ساعت',
    offline: true,
    online: false,
    sharedType: 'اصلی',
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s1k.webp',
    gallery: [
      'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scj7t3.webp',
      'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scj7sy.webp'
    ],
    guarantee: ['ضمانت ۷ روزه تعویض', 'بازگشت وجه در صورت بن', 'پشتیبانی تلگرام هنگام فعال‌سازی'],
    activationSteps: [
      'دریافت یوزرنیم و پسورد از ربات تلگرام',
      'ورود به حساب در کنسول و فعال‌سازی Primary',
      'دانلود بازی و اجرا در اکانت شخصی'
    ]
  },
  {
    id: 'spider-man-2',
    slug: 'marvels-spider-man-2',
    title: 'Marvel’s Spider-Man 2',
    platform: 'PS5',
    price: 2299000,
    safePrice: 2599000,
    region: 'TR',
    isSafe: true,
    rating: 4.8,
    genre: 'action',
    description:
      'پیتر پارکر و مایلز مورالز در بزرگ‌ترین نسخه اسپایدرمن با قابلیت تعویض سریع بین قهرمانان، مناسب برای طرفداران تجربه آزاد شهری.',
    tags: ['Open World', 'Ray Tracing', 'Dual Protagonist'],
    features: ['15 دقیقه تحویل خودکار', 'آموزش تصویری فعال‌سازی', 'موجودی Safe و استاندارد'],
    approxPlaytime: '۳۰ ساعت',
    offline: true,
    online: false,
    sharedType: 'اشتراکی',
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co89xw.webp',
    gallery: [
      'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scq0l5.webp',
      'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scq0l8.webp'
    ],
    guarantee: ['پشتیبانی آنلاین', 'Safe Account ضد بن', 'آپدیت رایگان قیمت'],
    activationSteps: ['تحویل آنی حساب', 'اجرای حالت اشتراکی', 'فعال‌سازی مرورگر در کنسول']
  },
  {
    id: 'ea-fc-25',
    slug: 'ea-sports-fc-25',
    title: 'EA SPORTS FC™ 25',
    platform: 'PS5',
    price: 1999000,
    safePrice: 2299000,
    region: 'TR',
    isSafe: false,
    rating: 4.4,
    genre: 'sports',
    description:
      'آخرین نسخه فوتبال الکترونیک با مود محبوب Ultimate Team و Career. مناسب برای بازی آنلاین و مسابقات.',
    tags: ['آنلاین', 'رقابتی', 'Budget Friendly'],
    features: ['تحویل زیر ۳۰ ثانیه', 'کد تخفیف Game Club', 'وضعیت موجودی روزانه'],
    approxPlaytime: 'بی‌نهایت',
    offline: true,
    online: true,
    sharedType: 'اشتراکی',
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8a3c.webp',
    gallery: [
      'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scpe2j.webp',
      'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scpe2k.webp'
    ],
    guarantee: ['پشتیبانی تورنمنت تلگرام', 'تعویض سریع در صورت لاینک', 'تضمین پرداخت PSP'],
    activationSteps: ['تکمیل پرداخت درگاه', 'تحویل یوزر Safe یا Standard', 'ورود و دانلود بازی']
  },
  {
    id: 'elden-ring',
    slug: 'elden-ring-shadow',
    title: 'Elden Ring + Shadow of the Erdtree',
    platform: 'PS5',
    price: 2199000,
    safePrice: 2499000,
    region: 'R1',
    isSafe: true,
    rating: 4.8,
    genre: 'story',
    description:
      'ترکیب نسخه کامل بازی به همراه DLC محبوب Shadow of the Erdtree با راهنمای فارسی و پشتیبانی هنگام اتصال به سرور.',
    tags: ['RPG', 'Co-op', 'Challenging'],
    features: ['ساپورت Co-op', 'آموزش ضد بن', 'سازگار با Firmware جدید'],
    approxPlaytime: '۷۰+ ساعت',
    offline: true,
    online: true,
    sharedType: 'اصلی',
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7zwj.webp',
    gallery: [
      'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scp2op.webp',
      'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scp2oq.webp'
    ],
    guarantee: ['۱۰۰٪ ضد بن', 'ریست رایگان روی کنسول جدید', 'پشتیبانی شبانه‌روزی'],
    activationSteps: ['دریافت اطلاعات', 'فعال‌سازی Primary بر اساس ویدیو', 'اجرای بازی روی اکانت شخصی']
  }
];

export const sampleReviews: Review[] = [
  {
    id: 1,
    user: 'علی رضایی',
    handle: '@alireza.gg',
    rating: 5,
    text: 'کمتر از ۲ دقیقه اطلاعات اکانت رسید، راهنمایی مرحله‌به‌مرحله هم عالی بود.',
    avatar: 'https://i.pravatar.cc/100?img=52'
  },
  {
    id: 2,
    user: 'مریم سادات',
    handle: '@mariamsadat',
    rating: 4,
    text: 'پلن Game Club واقعا باعث شد ماهیانه ارزان‌تر بازی کنم.',
    avatar: 'https://i.pravatar.cc/100?img=36'
  },
  {
    id: 3,
    user: 'سینا سلیمانی',
    handle: '@sinaplay',
    rating: 5,
    text: 'گارانتی تعویض تو ۲ ساعت انجام شد، تجربه عالی بود.',
    avatar: 'https://i.pravatar.cc/100?img=21'
  }
];

export const cartItems = [
  { id: 'cart-1', title: 'God of War Ragnarök', type: 'Safe', price: 2899000, region: 'R2', quantity: 1 },
  { id: 'cart-2', title: 'EA SPORTS FC™ 25', type: 'Standard', price: 1999000, region: 'TR', quantity: 1 }
];

export const dashboardData = {
  ordersToday: 42,
  revenueToday: 126_500_000,
  newUsers: 18,
  stockAlerts: 5,
  topGames: [
    { title: 'God of War Ragnarök', sales: 15 },
    { title: 'EA SPORTS FC™ 25', sales: 12 },
    { title: 'Elden Ring + DLC', sales: 9 }
  ]
};

export const userOrders = [
  {
    id: 'ORD-98132',
    status: 'assigned',
    date: '۱۴۰۳/۱۰/۰۱',
    amount: 2899000,
    game: 'God of War Ragnarök',
    accountMasked: 'gow***42'
  },
  {
    id: 'ORD-97102',
    status: 'pending',
    date: '۱۴۰۳/۰۹/۲۵',
    amount: 1999000,
    game: 'EA SPORTS FC™ 25',
    accountMasked: 'ea***19'
  }
];

export const priceAlerts = [
  { id: 1, game: 'Marvel’s Spider-Man 2', target: 2000000, channel: 'تلگرام', active: true },
  { id: 2, game: 'Elden Ring + DLC', target: 2200000, channel: 'ایمیل', active: true }
];
