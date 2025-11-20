import { Schema, model, type Document, Types } from 'mongoose';

export interface ReviewDocument extends Document {
  gameId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reviewSchema.index({ gameId: 1, createdAt: -1 });

export const ReviewModel = model<ReviewDocument>('Review', reviewSchema);
