// src/types/instructorTypes.ts
import { Document, PopulatedDoc } from 'mongoose';
import { HydratedUserDocument } from './userTypes.js';

export interface IInstructorProfile extends Document {
  user: PopulatedDoc<HydratedUserDocument>; // Bu profilin hangi kullanıcıya (eğitmene) ait olduğu
  bio: string; // Eğitmenin biyografisi
  expertise: string[]; // Uzmanlık alanları (örn: ['React', 'Node.js'])
  website?: string; // Kişisel web sitesi
  socials?: { // Sosyal medya linkleri
    twitter?: string;
    linkedin?: string;
  };
}