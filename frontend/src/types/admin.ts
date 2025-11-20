export type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailedDescription?: string;
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;
  safeAccountAvailable: boolean;
  coverUrl?: string;
  gallery?: string[];
  tags: string[];
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    id: string;
    selectedOptions: Record<string, string>;
    price: number;
    stock: number;
  }[];
};

export type NewProductState = {
  title: string;
  slug: string;
  description: string;
  genre: string;
  platform: string;
  regionOptions: string;
  basePrice: string;
  safeAccountAvailable: boolean;
  coverUrl: string;
  gallery: string[];
  tags: string;
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    id: string;
    selectedOptions: Record<string, string>;
    price: number;
    stock: number;
  }[];
};

export const initialNewProduct: NewProductState = {
  title: '',
  slug: '',
  description: '',
  genre: 'اکشن',
  platform: 'PS5',
  regionOptions: 'R2',
  basePrice: '1500000',
  safeAccountAvailable: true,
  coverUrl: '',
  gallery: [],
  tags: 'حماسی,Safe',
  options: [],
  variants: []
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerInfo: {
    name?: string;
    email: string;
    phone: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  fulfillmentStatus: 'pending' | 'assigned' | 'delivered' | 'refunded';
  totalAmount: number;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    gameTitle: string;
    variantId?: string;
    selectedOptions?: Record<string, string>;
    quantity: number;
    pricePaid: number;
  }>;
  deliveryInfo?: {
    message?: string;
    credentials?: string;
    deliveredAt?: string;
  };
  customerAcknowledgement?: {
    acknowledged: boolean;
    acknowledgedAt?: string;
  };
};

export type HomeHeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: { id: string; label: string; value: string }[];
};

export type HomeSpotlight = {
  id: string;
  title: string;
  description: string;
  href: string;
  accent: string;
};

export type HomeTrustSignal = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type HomeTestimonial = {
  id: string;
  name: string;
  handle: string;
  text: string;
  avatar: string;
  highlight?: boolean;
};

export type HomeContentState = {
  hero: HomeHeroContent;
  spotlights: HomeSpotlight[];
  trustSignals: HomeTrustSignal[];
  testimonials: HomeTestimonial[];
};
