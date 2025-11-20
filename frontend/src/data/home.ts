export type GameCardContent = {
  id: string;
  slug?: string;
  title: string;
  platform: string;
  price: number;
  region: string;
  safe: boolean;
  monthlyPrice: number;
  category: string;
  rating: number;
  cover: string;
};

export const popularGames: GameCardContent[] = [
  {
    id: 'gow-ragnarok',
    title: 'God of War Ragnarök',
    platform: 'PS5',
    price: 2499000,
    monthlyPrice: 749000,
    region: 'R2',
    safe: true,
    category: 'story',
    rating: 4.9,
    cover:
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s1k.webp'
  },
  {
    id: 'ea-fc-25',
    title: 'EA SPORTS FC™ 25',
    platform: 'PS5',
    price: 2199000,
    monthlyPrice: 649000,
    region: 'TR',
    safe: false,
    category: 'sports',
    rating: 4.5,
    cover:
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co8a3c.webp'
  },
  {
    id: 'elden-ring',
    title: 'Elden Ring Shadow of the Erdtree',
    platform: 'PS5',
    price: 2799000,
    monthlyPrice: 799000,
    region: 'R1',
    safe: true,
    category: 'action',
    rating: 4.8,
    cover:
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co7zwj.webp'
  },
  {
    id: 'gran-turismo-7',
    title: 'Gran Turismo 7',
    platform: 'PS5',
    price: 1899000,
    monthlyPrice: 559000,
    region: 'TR',
    safe: true,
    category: 'kids',
    rating: 4.4,
    cover:
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co4edu.webp'
  }
];

export const categories = [
  { id: 'action', title: 'اکشن سینمایی', description: 'God of War، Spider-Man و عناوین پرهیجان دیگر.' },
  { id: 'sports', title: 'ورزشی و رقابتی', description: 'برای عاشقان FIFA، NBA و رقابت آنلاین.' },
  { id: 'story', title: 'داستان‌محور', description: 'بازی‌های سینمایی با روایت عمیق و شخصیت‌های به‌یادماندنی.' },
  { id: 'family', title: 'مناسب خانواده', description: 'Minecraft، Sackboy و گزینه‌های مطمئن برای کودکان.' },
  { id: 'budget', title: 'گیم‌های اقتصادی', description: 'انتخاب‌های زیر ۹۰۰ هزار تومان با ضمانت GameClub.' }
];

export const trustSignals = [
  { icon: '✅', title: 'گارانتی ۷ روزه تعویض', description: 'هر مشکلی بود اکانت جدید تحویل می‌گیرید.' },
  { icon: '🛡️', title: '۱۰۰٪ قانونی', description: 'اکانت‌های ضد بن با دستورالعمل رسمی فعال‌سازی.' },
  { icon: '⚡', title: 'تحویل زیر ۳۰ ثانیه', description: 'اتصال مستقیم به ربات اتوماسیون برای ارسال اطلاعات.' },
  { icon: '💬', title: 'پشتیبانی تلگرام', description: 'کارشناسان فارسی‌زبان در کل مراحل همراه شما هستند.' }
];

export const testimonials = [
  {
    id: 1,
    name: 'عرفان از شیراز',
    handle: '@erfanplays',
    text: 'فعال‌سازی کمتر از ۵ دقیقه طول کشید و پشتیبانی دقیقاً وسط نصب کمک کرد.',
    avatar: 'https://i.pravatar.cc/100?img=15'
  },
  {
    id: 2,
    name: 'فاطمه از تهران',
    handle: '@fatima.gg',
    text: 'گارانتی تعویض واقعاً عملیه، برای دوست‌هام هم سفارش دادم.',
    avatar: 'https://i.pravatar.cc/100?img=45'
  },
  {
    id: 3,
    name: 'امیرحسین از تبریز',
    handle: '@amirplays',
    text: 'قیمت‌ها از همه جا پایین‌تر بود و اکانت Safe گرفتیم که خیال‌مون راحت باشه.',
    avatar: 'https://i.pravatar.cc/100?img=12'
  }
];
