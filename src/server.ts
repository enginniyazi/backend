// src/server.ts

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Konfigürasyon dosyalarını import ediyoruz
import { connectDB } from './config/database.js';

// Performans izleme middleware'i
import { metricsMiddleware, trackApiResponseTime } from './middleware/metricsMiddleware.js';

// Tüm rota dosyalarını import ediyoruz
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import homeRoutes from './routes/homeRoutes.js';

// Swagger dokümantasyonu
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';

// Middleware'leri import ediyoruz
import { errorHandler } from './middleware/errorMiddleware.js';
import { generalRateLimit, authRateLimit } from './middleware/rateLimitMiddleware.js';

dotenv.config();


// app nesnesini oluşturup testler için export ediyoruz
export const app = express();

// Performans izleme middleware'i - diğer middleware'lerden önce ekle
app.use(metricsMiddleware);
app.use(trackApiResponseTime);

// Middleware'ler
// CORS yapılandırması
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // origin olmadığında (örn. Postman gibi araçlar) veya izin verilen bir origin olduğunda
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS politikası nedeniyle erişim engellendi'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // İzin verilen metotlar
  allowedHeaders: ['Content-Type', 'Authorization'], // İzin verilen başlıklar
  credentials: true // Cookie'lerin gönderilmesine izin ver
}));
app.use(express.json());

// Rate limiting middleware'leri - Auth endpoint'lerini hariç tut
app.use(generalRateLimit); // Genel rate limiting

// Statik dosya servisi
const __dirname = path.resolve(path.dirname(''));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ana Sayfa
app.use('/', homeRoutes);

// API Rotaları
app.use('/api/health', healthRoutes); // Health check endpoint'leri
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);

// Swagger Dokümantasyonu
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Yowa Academy API Documentation',
  customfavIcon: '/favicon.ico',
}));

// Hata Yönetimi
app.use(errorHandler);

// --- BAŞLATMA MANTIĞI ---

// Veritabanı metriklerini izleme
import { setupDbMetrics } from './middleware/dbMetricsMiddleware.js';

const PORT = process.env.PORT || 5001;

const start = async () => {
  try {
    // Veritabanı bağlantısı
    await connectDB();
    
    // Veritabanı metriklerini etkinleştir
    setupDbMetrics();

    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`Sunucu, http://localhost:${PORT} adresinde dinleniyor.`);
      console.log(`Metrikler: http://localhost:${PORT}/metrics`);
    });
  } catch (error) {
    console.error('Sunucu başlatma hatası:', error);
    process.exit(1);
  }
};

// EN ÖNEMLİ KISIM:
// Bu dosyayı, SADECE 'npm run dev' veya 'npm start' ile doğrudan çalıştırdığımızda,
// ve bir test tarafından 'import' edilmediğinde, sunucuyu başlat.
if (process.env.NODE_ENV !== 'test') {
  start();
}