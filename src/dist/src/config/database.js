// src/config/database.ts
import mongoose from 'mongoose';
export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI ortam değişkeni tanımlanmamış.');
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('Veritabanı bağlantı hatası:', error);
        process.exit(1);
    }
};
export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB bağlantısı kapatıldı.');
    }
    catch (error) {
        console.error('Veritabanı bağlantısı kapatılırken hata:', error);
    }
};
