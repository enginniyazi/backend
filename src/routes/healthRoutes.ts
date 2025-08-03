// src/routes/healthRoutes.ts
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

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