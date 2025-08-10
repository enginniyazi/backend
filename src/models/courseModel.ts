// src/models/courseModel.ts

import { model, Schema } from 'mongoose';
import { ICourse, ISection, ILecture } from '../types/courseTypes.js';

// Önce en içteki şemaları tanımlıyoruz

const LectureSchema = new Schema<ILecture>({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  videoUrl: { type: String },
  content: { type: String },
  isFree: { type: Boolean, default: false }, // Ücretsiz ders kontrolü
  order: { type: Number, required: true }, // Ders sırası
}, { timestamps: true });

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true }, // Bölüm sırası
  // Bir bölümün, ders şemasına uyan bir dizi dersi olabilir
  lectures: [LectureSchema],
}, { timestamps: true });

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 }, // Kısa açıklama
  // ref, Mongoose'a bu ID'nin 'User' koleksiyonuna ait olduğunu söyler.
  instructor: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  // Bir kursun, 'Category' koleksiyonuna ait birden fazla ID'si olabilir (Many-to-Many)
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  // Bir kursun, bölüm şemasına uyan bir dizi bölümü olabilir
  sections: [SectionSchema],
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // İndirim öncesi fiyat
  coverImage: { type: String, required: true },
  isPublished: { type: Boolean, default: false },

  // Yeni business logic alanları
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  language: { type: String, default: 'Türkçe' },
  totalDuration: { type: Number, default: 0 }, // Toplam süre (dakika)
  totalLectures: { type: Number, default: 0 }, // Toplam ders sayısı
  enrollmentCount: { type: Number, default: 0 }, // Kayıt sayısı
  rating: { type: Number, default: 0 }, // Ortalama puan
  reviewCount: { type: Number, default: 0 }, // Değerlendirme sayısı
  tags: [{ type: String }], // Etiketler
  requirements: [{ type: String }], // Gereksinimler
  learningOutcomes: [{ type: String }], // Öğrenme çıktıları
  certificateIncluded: { type: Boolean, default: false }, // Sertifika dahil mi
  isFeatured: { type: Boolean, default: false }, // Öne çıkan kurs
  discountPercentage: { type: Number, default: 0 }, // İndirim yüzdesi
  discountEndDate: { type: Date }, // İndirim bitiş tarihi
}, { timestamps: true });

// Virtual field for discounted price
CourseSchema.virtual('discountedPrice').get(function (this: any) {
  if (this.discountPercentage > 0 && this.discountEndDate > new Date()) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
});

// Pre-save hook to calculate totals
CourseSchema.pre('save', function (this: any, next) {
  if (this.sections && this.sections.length > 0) {
    this.totalDuration = this.sections.reduce((total: number, section: any) => {
      return total + section.lectures.reduce((sectionTotal: number, lecture: any) => {
        return sectionTotal + (lecture.duration || 0);
      }, 0);
    }, 0);

    this.totalLectures = this.sections.reduce((total: number, section: any) => {
      return total + section.lectures.length;
    }, 0);
  }
  next();
});

// Modeli oluşturup dışa aktarıyoruz
const Course = model<ICourse>('Course', CourseSchema);
export default Course;