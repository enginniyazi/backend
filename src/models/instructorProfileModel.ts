// src/models/instructorProfileModel.ts
import { model, Schema } from 'mongoose';
import { IInstructorProfile } from '../types/instructorTypes.js';

const InstructorProfileSchema = new Schema<IInstructorProfile>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, required: true },
  expertise: [{ type: String }],
  website: { type: String },
  socials: {
    twitter: { type: String },
    linkedin: { type: String },
  },
}, { timestamps: true });

const InstructorProfile = model<IInstructorProfile>('InstructorProfile', InstructorProfileSchema);
export default InstructorProfile;