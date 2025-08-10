// src/middleware/uploadMiddleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { customMetrics } from './metricsMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();
// Metrik ayarlarını çevre değişkenlerinden al
const metricsEnabled = process.env.METRICS_ENABLED !== 'false';
// Dosya tipi ve güvenlik kontrolü
const checkFileType = (file, cb) => {
    // İzin verilen dosya tipleri
    const filetypes = /jpeg|jpg|png|gif|webp/;
    // Dosya uzantısı kontrolü
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // MIME tipi kontrolü
    const mimetype = filetypes.test(file.mimetype);
    // Dosya adında tehlikeli karakterler olup olmadığını kontrol et
    const hasDangerousChars = /[&\/#,+()$~%'":*?<>{}]/g.test(file.originalname);
    if (mimetype && extname && !hasDangerousChars) {
        return cb(null, true);
    }
    else if (hasDangerousChars) {
        cb(new Error('Hata: Dosya adında geçersiz karakterler bulunuyor!'));
    }
    else {
        cb(new Error('Hata: Sadece resim dosyaları (JPEG, JPG, PNG, GIF, WEBP) yüklenebilir!'));
    }
};
// Dosya depolama yapılandırması
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Hangi rotadan geliyorsa, ona göre bir alt klasör oluştur/kullan
        let dir = 'uploads/';
        if (req.originalUrl.includes('/users/profile/avatar')) {
            dir += 'avatars/';
        }
        else if (req.originalUrl.includes('/courses')) {
            dir += 'course-covers/';
        }
        else if (req.originalUrl.includes('/instructors/documents')) {
            dir += 'instructor-documents/';
        }
        else {
            dir += 'misc/';
        }
        // Klasör yoksa oluştur
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Dosya adını güvenli hale getir: rastgele bir string + zaman damgası + orijinal uzantı
        const randomString = crypto.randomBytes(8).toString('hex');
        const safeFileName = `${file.fieldname}-${randomString}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`;
        cb(null, safeFileName);
    }
});
// Dosya yükleme limitleri ve yapılandırması
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB maksimum dosya boyutu
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});
// Dosya yükleme hatalarını yakalayan middleware
export const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.' });
        }
        return res.status(400).json({ message: `Dosya yükleme hatası: ${err.message}` });
    }
    else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};
// Dosya yükleme metriklerini izleyen middleware
export const trackFileUpload = (req, res, next) => {
    // Metrikler devre dışıysa hiçbir şey yapma
    if (!metricsEnabled) {
        return next();
    }
    // Orijinal fonksiyonu sakla
    const originalSend = res.send;
    // Yanıt gönderildiğinde çalışacak fonksiyon
    res.send = function (...args) {
        // Başarılı bir dosya yükleme işlemi ise metriği artır
        if (res.statusCode >= 200 && res.statusCode < 300 && req.file) {
            // Dosya tipini belirle
            let uploadType = 'misc';
            if (req.originalUrl.includes('/profile/avatar')) {
                uploadType = 'avatar';
            }
            else if (req.originalUrl.includes('/courses')) {
                uploadType = 'course-cover';
            }
            else if (req.originalUrl.includes('/instructors/documents')) {
                uploadType = 'instructor-document';
            }
            // Metriği artır
            customMetrics.fileUploads.labels(uploadType).inc();
        }
        // Orijinal send fonksiyonunu çağır
        return originalSend.apply(res, args);
    };
    next();
};
export default upload;
