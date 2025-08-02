// src/types/couponTypes.ts
import { Document, Types } from 'mongoose';

export interface IDiscountCoupon extends Document {
  code: string; // örn: YAZ2025
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: Date;
  isActive: boolean;
  usageLimit: number;
  timesUsed: number;
  description?: string;
}