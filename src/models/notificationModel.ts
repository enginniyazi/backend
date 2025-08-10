// src/models/notificationModel.ts

import { model, Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
    user: Types.ObjectId;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'payment' | 'system';
    isRead: boolean;
    readAt?: Date;
    actionUrl?: string;
    actionText?: string;
    expiresAt?: Date;
    priority: 'low' | 'medium' | 'high';
    metadata?: Record<string, any>;
}

const NotificationSchema = new Schema<INotification>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
        maxlength: 100,
    },
    message: {
        type: String,
        required: true,
        maxlength: 500,
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'course', 'payment', 'system'],
        default: 'info',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
    },
    actionUrl: {
        type: String,
    },
    actionText: {
        type: String,
        maxlength: 50,
    },
    expiresAt: {
        type: Date,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
}, { timestamps: true });

// Index'ler
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Pre-save hook to set readAt when marked as read
NotificationSchema.pre('save', function (next) {
    if (this.isModified('isRead') && this.isRead && !this.readAt) {
        this.readAt = new Date();
    }
    next();
});

const Notification = model<INotification>('Notification', NotificationSchema);

export default Notification; 