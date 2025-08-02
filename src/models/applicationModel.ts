// src/models/applicationModel.ts
import { model, Schema } from 'mongoose';
import { IApplication, IStatusHistory } from '../types/applicationTypes.js';

// Durum geçmişi için ayrı bir şema tanımlamak en temiz yoldur.
const StatusHistorySchema = new Schema<IStatusHistory>({
    status: { type: String, enum: ['Submitted', 'Reviewed', 'Contacted', 'Closed'], required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Admin ID'si
}, { _id: false }); // Alt dökümanlar için kendi ID'lerini oluşturma

const ApplicationSchema = new Schema<IApplication>({
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  status: {
    type: String,
    enum: ['Submitted', 'Reviewed', 'Contacted', 'Closed'],
    default: 'Submitted',
  },
  
  // YENİ ALAN
  statusHistory: [StatusHistorySchema], // Şema, StatusHistorySchema'yı bir dizi olarak kullanır.

  notes: { type: String },
}, { timestamps: true });

// YENİ Mongoose Middleware'i: Yeni bir başvuru oluşturulduğunda...
ApplicationSchema.pre('save', function (next) {
    // Eğer bu YENİ bir dökümansa ve statusHistory boşsa...
    if (this.isNew && this.statusHistory.length === 0) {
        // İlk durumu (Submitted) geçmişe otomatik olarak ekle.
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
            // 'changedBy' burada boş olabilir, çünkü bu bir admin değil, sistem eylemi.
        });
    }
    next();
});

const Application = model<IApplication>('Application', ApplicationSchema);
export default Application;