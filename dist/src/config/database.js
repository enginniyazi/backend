// src/config/database.ts
import mongoose from 'mongoose';
// Yeniden bağlanma denemesi için maksimum sayı
const MAX_RETRIES = 3;
// Yeniden bağlanma denemeleri arasındaki bekleme süresi (ms)
const RETRY_INTERVAL = 5000;
export const connectDB = async (retryCount = 0) => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI ortam değişkeni tanımlanmamış.');
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
        // Bağlantı kesildiğinde yeniden bağlanma stratejisi
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB bağlantısı kesildi. Yeniden bağlanmaya çalışılıyor...');
            setTimeout(() => connectDB(), RETRY_INTERVAL);
        });
    }
    catch (error) {
        console.error(`Veritabanı bağlantı hatası (Deneme ${retryCount + 1}/${MAX_RETRIES}):`, error);
        if (retryCount < MAX_RETRIES - 1) {
            console.log(`${RETRY_INTERVAL / 1000} saniye sonra yeniden bağlanmaya çalışılacak...`);
            setTimeout(() => connectDB(retryCount + 1), RETRY_INTERVAL);
        }
        else {
            console.error(`Maksimum yeniden bağlanma denemesi (${MAX_RETRIES}) aşıldı. Uygulama veritabanı olmadan çalışmaya devam edecek, ancak bazı işlevler çalışmayabilir.`);
            // Burada process.exit(1) yerine, uygulamanın çalışmaya devam etmesine izin veriyoruz
            // Böylece uygulama tamamen çökmek yerine, en azından sağlık kontrolü gibi bazı endpoint'ler çalışabilir
        }
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
