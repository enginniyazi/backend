// src/models/campaignModel.ts
import { model, Schema } from 'mongoose';
import { ICampaign } from '../types/campaignTypes.js';

const CampaignSchema = new Schema<ICampaign>({
  title: { 
    type: String, 
    required: [true, 'Kampanya başlığı zorunludur'],
    trim: true,
    minlength: [3, 'Kampanya başlığı en az 3 karakter olmalıdır']
  },
  description: { 
    type: String, 
    required: [true, 'Kampanya açıklaması zorunludur'],
    trim: true,
    minlength: [10, 'Kampanya açıklaması en az 10 karakter olmalıdır']
  },
  startDate: { 
    type: Date, 
    required: [true, 'Başlangıç tarihi zorunludur']
  },
  endDate: { 
    type: Date, 
    required: [true, 'Bitiş tarihi zorunludur']
  },
  isActive: { 
    type: Boolean, 
    default: false 
  },
  featuredCourses: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Course',
    required: [true, 'En az bir kurs seçilmelidir']
  }],
}, { timestamps: true });

// Tarih validasyonu için pre-save hook
CampaignSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır'));
  }
  next();
});

const Campaign = model<ICampaign>('Campaign', CampaignSchema);
export default Campaign;