/**
 * Product Templates - Frontend copy of backend templates
 * Used for rendering dynamic forms in admin panel
 */

export interface ProductFieldDefinition {
  name: string;
  label: string;
  labelEn?: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'textarea' | 'color' | 'image';
  required?: boolean;
  options?: string[];
  unit?: string;
  placeholder?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ProductTemplate {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
  fields: ProductFieldDefinition[];
  inventory: {
    trackInventory: boolean;
    required: boolean;
  };
  shipping: {
    requiresShipping: boolean;
    required: boolean;
  };
}

export const PRODUCT_TEMPLATES: Record<string, ProductTemplate> = {
  digital_game: {
    id: 'digital_game',
    name: 'بازی دیجیتال',
    nameEn: 'Digital Game',
    icon: '🎮',
    color: 'emerald',
    description: 'بازی‌های دیجیتال برای کنسول‌ها و PC',
    fields: [],
    inventory: { trackInventory: false, required: false },
    shipping: { requiresShipping: false, required: false }
  },
  action_figure: {
    id: 'action_figure',
    name: 'اکشن فیگور',
    nameEn: 'Action Figure',
    icon: '🦸',
    color: 'purple',
    description: 'فیگورهای اکشن و کلکسیونی',
    fields: [
      { name: 'brand', label: 'برند', type: 'text', required: true, placeholder: 'مثلاً Hot Toys' },
      { name: 'series', label: 'سری', type: 'text', required: true },
      { name: 'character', label: 'شخصیت', type: 'text', required: true },
      { name: 'height', label: 'ارتفاع', type: 'number', unit: 'cm' },
      { name: 'material', label: 'جنس', type: 'text', placeholder: 'مثلاً PVC, ABS' },
      { name: 'articulation', label: 'نقاط مفصلی', type: 'number' },
      { name: 'accessories', label: 'لوازم جانبی', type: 'textarea' },
      { name: 'limited', label: 'نسخه محدود', type: 'boolean' }
    ],
    inventory: { trackInventory: true, required: true },
    shipping: { requiresShipping: true, required: true }
  },
  collectible_card: {
    id: 'collectible_card',
    name: 'کارت کلکسیونی',
    nameEn: 'Collectible Card',
    icon: '🃏',
    color: 'blue',
    description: 'کارت‌های کلکسیونی بازی‌ها',
    fields: [
      { name: 'game', label: 'بازی', type: 'select', required: true, options: ['Pokemon', 'Yu-Gi-Oh!', 'Magic: The Gathering'] },
      { name: 'set', label: 'ست', type: 'text', required: true },
      { name: 'rarity', label: 'کمیابی', type: 'select', required: true, options: ['Common', 'Rare', 'Ultra Rare'] },
      { name: 'condition', label: 'وضعیت', type: 'select', required: true, options: ['Mint', 'Near Mint', 'Excellent'] },
      { name: 'graded', label: 'گرید شده', type: 'boolean' }
    ],
    inventory: { trackInventory: true, required: true },
    shipping: { requiresShipping: true, required: true }
  },
  gaming_gear: {
    id: 'gaming_gear',
    name: 'تجهیزات گیمینگ',
    nameEn: 'Gaming Gear',
    icon: '🎧',
    color: 'indigo',
    description: 'هدست، ماوس، کیبورد و لوازم جانبی',
    fields: [
      { name: 'productType', label: 'نوع محصول', type: 'select', required: true, options: ['Headset', 'Mouse', 'Keyboard', 'Controller'] },
      { name: 'brand', label: 'برند', type: 'text', required: true },
      { name: 'model', label: 'مدل', type: 'text', required: true },
      { name: 'connectivity', label: 'نوع اتصال', type: 'select', options: ['Wired', 'Wireless', 'Bluetooth'] },
      { name: 'warranty', label: 'گارانتی', type: 'text' }
    ],
    inventory: { trackInventory: true, required: true },
    shipping: { requiresShipping: true, required: true }
  },
  apparel: {
    id: 'apparel',
    name: 'لباس و مرچ',
    nameEn: 'Apparel',
    icon: '👕',
    color: 'pink',
    description: 'تی‌شرت، هودی، کلاه',
    fields: [
      { name: 'itemType', label: 'نوع', type: 'select', required: true, options: ['T-Shirt', 'Hoodie', 'Cap'] },
      { name: 'size', label: 'سایز', type: 'select', options: ['S', 'M', 'L', 'XL', '2XL'] },
      { name: 'color', label: 'رنگ', type: 'select', options: ['Black', 'White', 'Gray'] },
      { name: 'official', label: 'رسمی', type: 'boolean' }
    ],
    inventory: { trackInventory: true, required: true },
    shipping: { requiresShipping: true, required: true }
  },
  digital_content: {
    id: 'digital_content',
    name: 'محتوای دیجیتال',
    nameEn: 'Digital Content',
    icon: '📚',
    color: 'cyan',
    description: 'کتاب، موسیقی، ویدیو',
    fields: [
      { name: 'contentType', label: 'نوع محتوا', type: 'select', required: true, options: ['E-Book', 'Soundtrack', 'DLC'] },
      { name: 'format', label: 'فرمت', type: 'select', options: ['PDF', 'MP3', 'MP4'] },
      { name: 'fileSize', label: 'حجم', type: 'text' }
    ],
    inventory: { trackInventory: false, required: false },
    shipping: { requiresShipping: false, required: false }
  }
};

export function getProductTemplate(type: string): ProductTemplate | null {
  return PRODUCT_TEMPLATES[type] || null;
}

export function getAllProductTemplates(): ProductTemplate[] {
  return Object.values(PRODUCT_TEMPLATES);
}
