// src/models/categoryModel.ts
import { model, Schema } from 'mongoose';
const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
}, { timestamps: true });
const Category = model('Category', CategorySchema);
export default Category;
