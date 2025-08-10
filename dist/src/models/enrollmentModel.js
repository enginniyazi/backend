// src/models/enrollmentModel.ts
import { model, Schema } from 'mongoose';
const EnrollmentSchema = new Schema({
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
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'bank_transfer', 'crypto', 'coupon', 'test', 'iyzipay'],
    },
    paymentDate: {
        type: Date,
    },
    enrolledAt: {
        type: Date,
        default: Date.now,
    },
    // Yeni business logic alanları
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    completedLectures: [{
            type: Schema.Types.ObjectId,
            ref: 'Lecture',
        }],
    currentLecture: {
        type: Schema.Types.ObjectId,
        ref: 'Lecture',
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now,
    },
    certificateIssued: {
        type: Boolean,
        default: false,
    },
    certificateIssuedAt: {
        type: Date,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        maxlength: 1000,
    },
    reviewDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    completedAt: {
        type: Date,
    },
}, { timestamps: true });
// Index'ler
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ user: 1, isActive: 1 });
EnrollmentSchema.index({ course: 1, isActive: 1 });
// Pre-save hook to update progress
EnrollmentSchema.pre('save', function (next) {
    if (this.isModified('completedLectures')) {
        // Progress hesaplama (basit versiyon - gerçek implementasyonda course'daki toplam lecture sayısına göre hesaplanmalı)
        // Bu örnek için %20'lik artışlar
        this.progress = Math.min(100, this.completedLectures.length * 20);
        if (this.progress === 100 && !this.completedAt) {
            this.completedAt = new Date();
        }
    }
    next();
});
const Enrollment = model('Enrollment', EnrollmentSchema);
export default Enrollment;
