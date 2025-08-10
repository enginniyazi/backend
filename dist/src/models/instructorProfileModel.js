// src/models/instructorProfileModel.ts
import { model, Schema } from 'mongoose';
const InstructorProfileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, required: true },
    expertise: [{ type: String }],
    website: { type: String },
    socials: {
        twitter: { type: String },
        linkedin: { type: String },
    },
}, { timestamps: true });
const InstructorProfile = model('InstructorProfile', InstructorProfileSchema);
export default InstructorProfile;
