// src/middleware/dbMetricsMiddleware.ts
import mongoose from 'mongoose';
import { customMetrics } from './metricsMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();
// Metrik ayarlarını çevre değişkenlerinden al
const metricsEnabled = process.env.METRICS_ENABLED !== 'false';
/**
 * Mongoose modellerinde veritabanı işlemlerini izlemek için middleware
 * Bu fonksiyon, tüm modellere metrik toplama middleware'lerini ekler
 */
export const setupDbMetrics = () => {
    // Metrikler devre dışıysa hiçbir şey yapma
    if (!metricsEnabled) {
        console.log('Veritabanı metrikleri devre dışı.');
        return;
    }
    // Tüm modeller için pre/post hook'ları ekle
    const modelNames = Object.keys(mongoose.models);
    if (modelNames.length === 0) {
        console.log('Henüz hiçbir model yüklenmemiş, veritabanı metrikleri etkinleştirilemiyor.');
        return;
    }
    // Mongoose query middleware'lerini ekle
    const originalExec = mongoose.Query.prototype.exec;
    mongoose.Query.prototype.exec = async function (...args) {
        const modelName = this.model.modelName;
        const operation = this.op;
        try {
            const result = await originalExec.apply(this, args);
            // Operasyon tipine göre metriği artır
            if (operation === 'find' || operation === 'findOne') {
                customMetrics.dbOperations.labels('find', modelName).inc();
            }
            else if (operation === 'update' || operation === 'updateOne' || operation === 'updateMany') {
                customMetrics.dbOperations.labels('update', modelName).inc();
            }
            else if (operation === 'remove' || operation === 'deleteOne' || operation === 'deleteMany') {
                customMetrics.dbOperations.labels('delete', modelName).inc();
            }
            return result;
        }
        catch (error) {
            throw error;
        }
    };
    // Save işlemi için middleware
    modelNames.forEach(modelName => {
        const model = mongoose.models[modelName];
        // Create/Update işlemi (save)
        model.schema.post('save', function () {
            if (this.isNew) {
                customMetrics.dbOperations.labels('create', modelName).inc();
            }
            else {
                customMetrics.dbOperations.labels('update', modelName).inc();
            }
        });
    });
    console.log(`Veritabanı metrikleri ${modelNames.length} model için etkinleştirildi:`, modelNames);
};
