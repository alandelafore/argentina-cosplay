import mongoose, { Schema, Document, model } from "mongoose";

export interface SearchLogDocument extends Document {
  query: string;
  filters: Record<string, any>;
  results: number;
  userId?: string;
  ip: string;
  createdAt: Date;
}

const SearchLogSchema = new Schema<SearchLogDocument>({
  query: { type: String, required: true },
  filters: { type: Schema.Types.Mixed, default: {} },
  results: { type: Number, default: 0 },
  userId: { type: String },
  ip: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const SearchLog = model<SearchLogDocument>("SearchLog", SearchLogSchema);

export interface ProductViewDocument extends Document {
  productId: string;
  userId?: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const ProductViewSchema = new Schema<ProductViewDocument>({
  productId: { type: String, required: true },
  userId: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const ProductView = model<ProductViewDocument>("ProductView", ProductViewSchema);

export interface PriceHistoryDocument extends Document {
  productId: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  createdAt: Date;
}

const PriceHistorySchema = new Schema<PriceHistoryDocument>({
  productId: { type: String, required: true },
  oldPrice: { type: Number, required: true },
  newPrice: { type: Number, required: true },
  changedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const PriceHistory = model<PriceHistoryDocument>("PriceHistory", PriceHistorySchema);
