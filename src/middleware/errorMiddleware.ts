// src/middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Mongoose validation hatalarını yakala
    if (err.name === 'ValidationError') {
        statusCode = 400;
    }
    // Mongoose cast hatalarını yakala (geçersiz ID formatı vb.)
    if (err.name === 'CastError') {
        statusCode = 400;
    }

    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};