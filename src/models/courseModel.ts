// src/models/courseModel.ts

import { model, Schema } from 'mongoose';
import { ICourse, ISection, ILecture } from '../types/courseTypes.js';

// Önce en içteki şemaları tanımlıyoruz

const LectureSchema = new Schema<ILecture>({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  videoUrl: { type: String },
  content: { type: String },
}, { timestamps: true });

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  // Bir bölümün, ders şemasına uyan bir dizi dersi olabilir
  lectures: [LectureSchema],
}, { timestamps: true });

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  // ref, Mongoose'a bu ID'nin 'User' koleksiyonuna ait olduğunu söyler.
  instructor: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  // Bir kursun, 'Category' koleksiyonuna ait birden fazla ID'si olabilir (Many-to-Many)
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  // Bir kursun, bölüm şemasına uyan bir dizi bölümü olabilir
  sections: [SectionSchema],
  price: { type: Number, required: true },
  coverImage: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

// Modeli oluşturup dışa aktarıyoruz
const Course = model<ICourse>('Course', CourseSchema);
export default Course;