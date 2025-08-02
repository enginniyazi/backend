// src/models/leadModel.ts
import { model, Schema } from 'mongoose';
import { ILead } from '../types/leadTypes.js';

const LeadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
}, { timestamps: true });

const Lead = model<ILead>('Lead', LeadSchema);
export default Lead;