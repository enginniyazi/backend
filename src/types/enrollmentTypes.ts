// src/types/enrollmentTypes.ts

import { Document, Types, PopulatedDoc } from 'mongoose';
import { IUser } from './userTypes.js';
import { ICourse } from './courseTypes.js';

export interface IEnrollment extends Document {
  user: PopulatedDoc<IUser & Document>;
  course: PopulatedDoc<ICourse & Document>;
  paymentStatus: 'pending' | 'completed' | 'failed';
  enrolledAt: Date;
}