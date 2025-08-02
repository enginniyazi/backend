// src/types/applicationTypes.ts
import { Document, HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { ILead } from './leadTypes.js';
import { ICourse } from './courseTypes.js';

// Durum geçmişindeki her bir kaydın tipi
export interface IStatusHistory {
  status: 'Submitted' | 'Reviewed' | 'Contacted' | 'Closed';
  changedAt: Date;
  changedBy?: Types.ObjectId; // Bu değişikliği HANGİ admin'in yaptığını da tutabiliriz!
}

export interface IApplication extends Document {
  lead: PopulatedDoc<ILead & Document>;
  course: PopulatedDoc<ICourse & Document>;
  status: 'Submitted' | 'Reviewed' | 'Contacted' | 'Closed';
  statusHistory: IStatusHistory[];
  notes?: string;
}

export type HydratedApplicationDocument= HydratedDocument<IApplication>;