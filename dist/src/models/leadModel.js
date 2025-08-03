// src/models/leadModel.ts
import { model, Schema } from 'mongoose';
const LeadSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
}, { timestamps: true });
const Lead = model('Lead', LeadSchema);
export default Lead;
