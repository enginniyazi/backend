// src/models/categoryModel.ts

import { model, Schema } from 'mongoose';
import { ICategory } from '../types/categoryTypes.js';

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
}, { timestamps: true });

const Category = model<ICategory>('Category', CategorySchema);
export default Category;