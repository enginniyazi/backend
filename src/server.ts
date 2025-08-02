// src/server.ts

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Tüm rota dosyalarını import ediyoruz
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import couponRoutes from './routes/couponRoutes.js';

import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();


// app nesnesini oluşturup testler için export ediyoruz
export const app = express();

// Middleware'ler
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Statik dosya servisi
const __dirname = path.resolve(path.dirname(''));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Rotaları
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/campaigns', campaignRoutes);
// DİKKAT: Bir önceki kodunda burada bir yazım hatası vardı ('couponRoutes' yerine 'coupon'), düzelttim.
app.use('/api/coupons', couponRoutes); 

// Hata Yönetimi
app.use(errorHandler);

// --- BAŞLATMA MANTIĞI ---

const PORT = process.env.PORT || 5001;
const mongoUri = process.env.MONGO_URI;

const start = async () => {
  // Bu 'start' fonksiyonu, hem veritabanına bağlanır hem de sunucuyu dinler.
  if (!mongoUri) {
    throw new Error('MONGO_URI ortam değişkeni tanımlanmamış.');
  }
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB veritabanı bağlantısı başarılı!');
    app.listen(PORT, () => {
      console.log(`Sunucu, http://localhost:${PORT} adresinde dinleniyor.`);
    });
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    process.exit(1);
  }
};

// EN ÖNEMLİ KISIM:
// Bu dosyayı, SADECE 'npm run dev' veya 'npm start' ile doğrudan çalıştırdığımızda,
// ve bir test tarafından 'import' edilmediğinde, sunucuyu başlat.
if (process.env.NODE_ENV !== 'test') {
  start();
}