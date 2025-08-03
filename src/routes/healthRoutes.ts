// src/routes/healthRoutes.ts
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Sistem sağlığı kontrolü
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [OK, ERROR]
 *           description: Sistem durumu
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Kontrol zamanı
 *         uptime:
 *           type: number
 *           description: Sistem çalışma süresi (saniye)
 *         environment:
 *           type: string
 *           description: Çalışma ortamı
 *         database:
 *           type: string
 *           enum: [connected, disconnected]
 *           description: Veritabanı bağlantı durumu
 *         memory:
 *           type: object
 *           properties:
 *             used:
 *               type: number
 *               description: Kullanılan bellek (MB)
 *             total:
 *               type: number
 *               description: Toplam bellek (MB)
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Sistem sağlığı kontrolü
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Sistem sağlıklı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *       503:
 *         description: Sistem sağlıksız
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                   example: "Service unavailable"
 */

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Detaylı sistem sağlığı kontrolü
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detaylı sistem durumu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [OK, ERROR]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connected, disconnected]
 *                     host:
 *                       type: string
 *                     name:
 *                       type: string
 *                 memory:
 *                   type: object
 *                 cpu:
 *                   type: object
 *                 platform:
 *                   type: string
 *                 nodeVersion:
 *                   type: string
 *       503:
 *         description: Sistem sağlıksız
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                   example: "Service unavailable"
 *                 error:
 *                   type: string
 */

// Health check endpoint
router.get('/', async (req, res) => {
    try {
        // Veritabanı bağlantı durumunu kontrol et
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        const healthStatus = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: dbStatus,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            },
        };

        res.status(200).json(healthStatus);
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            message: 'Service unavailable',
        });
    }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
    try {
        const detailedStatus = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            database: {
                status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                host: mongoose.connection.host,
                name: mongoose.connection.name,
            },
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            nodeVersion: process.version,
        };

        res.status(200).json(detailedStatus);
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            message: 'Service unavailable',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router; 