import { Schema, model, type Document } from 'mongoose';

export interface GameDocument extends Document {
  title: string;
  slug: string;
  description: string;
  detailedDescription?: string; // Rich text HTML
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;
  safeAccountAvailable: boolean;
  coverUrl?: string;
  gallery?: string[]; // Additional product images
  tags: string[];
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    id: string;
    selectedOptions: Map<string, string>;
    price: number;
    stock: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<GameDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    detailedDescription: { type: String }, // Rich text HTML
    genre: [{ type: String, required: true }],
    platform: { type: String, required: true },
    regionOptions: [{ type: String, required: true }],
    basePrice: { type: Number, required: true },
    safeAccountAvailable: { type: Boolean, default: false },
    coverUrl: { type: String },
    gallery: [{ type: String }],
    tags: [{ type: String }],
    options: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        values: [{ type: String, required: true }]
      }
    ],
    variants: [
      {
        id: { type: String, required: true },
        selectedOptions: { type: Map, of: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

gameSchema.index({ title: 'text', description: 'text' });

gameSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, ...rest } = ret;
    return { ...rest, id: _id };
  }
});

export const GameModel = model<GameDocument>('Game', gameSchema);
