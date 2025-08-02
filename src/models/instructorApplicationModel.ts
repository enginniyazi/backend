// src/models/instructorApplicationModel.ts
import { model, Schema } from 'mongoose';
import { IInstructorApplication } from '../types/instructorApplicationTypes.js';

const InstructorApplicationSchema = new Schema<IInstructorApplication>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  bio: { type: String, required: true },
  expertise: [{ type: String, required: true }],
}, { timestamps: true });

const InstructorApplication = model<IInstructorApplication>('InstructorApplication', InstructorApplicationSchema);
export default InstructorApplication;