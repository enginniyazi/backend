// src/types/instructorApplicationTypes.ts
import { Document, PopulatedDoc } from 'mongoose';
import { HydratedUserDocument } from './userTypes.js';

export interface IInstructorApplication extends Document {
  user: PopulatedDoc<HydratedUserDocument>; // Başvuruyu yapan kullanıcı
  status: 'pending' | 'approved' | 'rejected'; // Başvuru durumu
  bio: string; // Eğitmen adayının biyografisi
  expertise: string[]; // Uzmanlık alanları
  // Admin'in notları gibi ek alanlar eklenebilir
}