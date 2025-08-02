// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { HydratedUserDocument } from '../types/userTypes.js';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

            // Daha önce oluşturduğumuz genişletilmiş Request tipi sayesinde bu atama geçerli.
            req.user = await User.findById(decoded.id).select('-password') as HydratedUserDocument;

            next();
        } catch (error) {
            res.status(401);
            next(new Error('Yetkiniz yok, token geçersiz.'));
        }
    }

    if (!token) {
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