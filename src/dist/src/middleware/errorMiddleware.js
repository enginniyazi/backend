import { logger } from '../utils/logger.js';
export const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    // Mongoose validation hatalarını yakala
    if (err.name === 'ValidationError') {
        statusCode = 400;
    }
    // Mongoose cast hatalarını yakala (geçersiz ID formatı vb.)
    if (err.name === 'CastError') {
        statusCode = 400;
    }
    // Hata loglaması
    logger.error('API Hatası', {
        error: err.message,
        stack: err.stack,
        statusCode,
        url: req.url,
        method: req.method,
        userId: req.user?._id
    }, req);
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};
