// src/types/campaignTypes.ts
import { Document, PopulatedDoc } from 'mongoose';
import { ICourse } from './courseTypes.js';

export interface ICampaign extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  // Kampanyaya dahil olan kurslar
  featuredCourses: PopulatedDoc<ICourse & Document>[];
}