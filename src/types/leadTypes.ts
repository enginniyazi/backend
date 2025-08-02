// src/types/leadTypes.ts
import { Document, HydratedDocument, Types } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  applications: Types.ObjectId[];
}

export type HydratedLeadDocument = HydratedDocument<ILead>;