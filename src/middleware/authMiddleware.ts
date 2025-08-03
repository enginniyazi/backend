// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel.js';
import { HydratedUserDocument } from '../types/userTypes.js';
import { verifyToken } from '../config/jwt.js';
import { logger } from '../utils/logger.js';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = verifyToken(token) as { id: string };

            // Daha önce oluşturduğumuz genişletilmiş Request tipi sayesinde bu atama geçerli.
            req.user = await User.findById(decoded.id).select('-password') as HydratedUserDocument;

            if (!req.user) {
                logger.warn('Token geçerli ama kullanıcı bulunamadı', { userId: decoded.id }, req);
                res.status(401);
                return next(new Error('Kullanıcı bulunamadı.'));
            }

            logger.debug('Kullanıcı kimlik doğrulaması başarılı', { userId: req.user._id }, req);
            next();
        } catch (error) {
            logger.warn('Geçersiz token', { error: error instanceof Error ? error.message : 'Unknown' }, req);
            res.status(401);
            next(new Error('Yetkiniz yok, token geçersiz.'));
        }
    }

    if (!token) {
        logger.warn('Token bulunamadı', {}, req);
        res.status(401);
        next(new Error('Yetkiniz yok, token bulunamadı.'));
    }
};

// Bu middleware, 'protect'ten SONRA çalışmalıdır.
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403); // Forbidden
            next(new Error(`'${req.user?.role}' rolü bu işlemi yapmaya yetkili değildir.`));
        } else {
            next();
        }
    };
};