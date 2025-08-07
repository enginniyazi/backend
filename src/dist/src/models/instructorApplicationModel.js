// src/models/instructorApplicationModel.ts
import { model, Schema } from 'mongoose';
const InstructorApplicationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    bio: { type: String, required: true },
    expertise: [{ type: String, required: true }],
}, { timestamps: true });
const InstructorApplication = model('InstructorApplication', InstructorApplicationSchema);
export default InstructorApplication;
