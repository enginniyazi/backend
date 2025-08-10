// src/models/certificateModel.ts

import { model, Schema, Document, Types } from 'mongoose';

export interface ICertificate extends Document {
    user: Types.ObjectId;
    course: Types.ObjectId;
    enrollment: Types.ObjectId;
    certificateNumber: string;
    issuedAt: Date;
    expiresAt?: Date;
    isActive: boolean;
    downloadUrl?: string;
    verificationCode: string;
}

const CertificateSchema = new Schema<ICertificate>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    course: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
    },
    enrollment: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Enrollment',
    },
    certificateNumber: {
        type: String,
        required: true,
        unique: true,
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    downloadUrl: {
        type: String,
    },
    verificationCode: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });

// Index'ler
CertificateSchema.index({ user: 1, course: 1 });
CertificateSchema.index({ certificateNumber: 1 });
CertificateSchema.index({ verificationCode: 1 });

// Pre-save hook to generate certificate number and verification code
CertificateSchema.pre('save', function (next) {
    if (this.isNew) {
        // Certificate number: YOWA-YYYY-XXXXX format
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        this.certificateNumber = `YOWA-${year}-${randomNum}`;

        // Verification code: 16 karakterlik alfanumerik
        this.verificationCode = Math.random().toString(36).substring(2, 18).toUpperCase();
    }
    next();
});

const Certificate = model<ICertificate>('Certificate', CertificateSchema);

export default Certificate; 