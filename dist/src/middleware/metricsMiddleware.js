// src/middleware/metricsMiddleware.ts
import promBundle from 'express-prom-bundle';
import * as promClient from 'prom-client';
import dotenv from 'dotenv';
dotenv.config();
// Metrik ayarlarını çevre değişkenlerinden al
const metricsPrefix = process.env.METRICS_PREFIX || 'yowa_';
const metricsEnabled = process.env.METRICS_ENABLED !== 'false';
const collectDefaults = process.env.METRICS_COLLECT_DEFAULT !== 'false';
const collectGC = process.env.METRICS_COLLECT_GC === 'true';
// Prometheus register'ını oluştur
const register = new promClient.Registry();
// Varsayılan metrikleri topla (eğer etkinse)
if (collectDefaults && metricsEnabled) {
    promClient.collectDefaultMetrics({
        prefix: metricsPrefix,
        register,
        gcDurationBuckets: collectGC ? [0.001, 0.01, 0.1, 1, 2, 5] : [],
    });
}
// Prometheus metriklerini toplamak için middleware
export const metricsMiddleware = metricsEnabled ? promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: { app: 'yowa-backend' },
    promClient: { collectDefaultMetrics: false }, // Yukarıda manuel olarak yapılandırdık
    metricsPath: '/metrics',
    formatStatusCode: (res) => res.statusCode.toString(),
    normalizePath: [
        // URL'lerdeki ID'leri parametreleştir (örn: /api/courses/123 -> /api/courses/:id)
        [/\/api\/courses\/[a-f0-9]{24}(\/?|\/.*)/, '/api/courses/:id$1'],
        [/\/api\/auth\/[a-f0-9]{24}(\/?|\/.*)/, '/api/auth/:id$1'],
        [/\/api\/categories\/[a-f0-9]{24}(\/?|\/.*)/, '/api/categories/:id$1'],
        [/\/api\/applications\/[a-f0-9]{24}(\/?|\/.*)/, '/api/applications/:id$1'],
        [/\/api\/coupons\/[a-f0-9]{24}(\/?|\/.*)/, '/api/coupons/:id$1'],
        [/\/api\/campaigns\/[a-f0-9]{24}(\/?|\/.*)/, '/api/campaigns/:id$1']
    ],
    // Bazı endpoint'leri metriklerden hariç tut
    autoregister: true,
    promRegistry: register
}) : (req, res, next) => next(); // Metrikler devre dışıysa boş middleware
// Özel metrikler için register'ı dışa aktar
export { register };
// Özel metrikler
export const customMetrics = metricsEnabled ? {
    // Veritabanı işlem sayacı
    dbOperations: new promClient.Counter({
        name: 'yowa_db_operations_total',
        help: 'Toplam veritabanı işlemi sayısı',
        labelNames: ['operation', 'model'],
        registers: [register]
    }),
    // Dosya yükleme sayacı
    fileUploads: new promClient.Counter({
        name: 'yowa_file_uploads_total',
        help: 'Toplam dosya yükleme sayısı',
        labelNames: ['type'],
        registers: [register]
    }),
    // Aktif kullanıcı sayacı
    activeUsers: new promClient.Gauge({
        name: 'yowa_active_users',
        help: 'Aktif kullanıcı sayısı',
        registers: [register]
    }),
    // Oturum süresi histogramı
    sessionDuration: new promClient.Histogram({
        name: 'yowa_session_duration_seconds',
        help: 'Kullanıcı oturum süresi (saniye)',
        buckets: [60, 300, 600, 1800, 3600, 7200],
        registers: [register]
    }),
    // API yanıt süresi histogramı
    apiResponseTime: new promClient.Histogram({
        name: 'yowa_api_response_time_seconds',
        help: 'API yanıt süresi (saniye)',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10],
        registers: [register]
    })
} : {
    // Metrikler devre dışıysa, boş nesneler döndür
    dbOperations: { labels: () => ({ inc: () => { } }) },
    fileUploads: { labels: () => ({ inc: () => { } }) },
    activeUsers: { inc: () => { }, dec: () => { }, set: () => { } },
    sessionDuration: { observe: () => { } },
    apiResponseTime: { labels: () => ({ observe: () => { } }) }
};
// Özel metrik middleware'i
export const trackApiResponseTime = (req, res, next) => {
    if (!metricsEnabled) {
        return next();
    }
    const start = process.hrtime();
    // Response tamamlandığında süreyi ölç
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const time = diff[0] + diff[1] / 1e9; // Saniye cinsinden
        // URL'deki ID'leri parametreleştir
        let route = req.originalUrl;
        const idPattern = /\/[a-f0-9]{24}(?:\/|$)/g;
        route = route.replace(idPattern, '/:id/');
        // Metriği kaydet
        customMetrics.apiResponseTime.labels(req.method, route, res.statusCode.toString()).observe(time);
    });
    next();
};
