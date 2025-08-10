// src/config/jwt.ts
import jwt from 'jsonwebtoken';

export const JWT_CONFIG = {
    get secret() {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
        }
        return secret;
    },
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

export const generateToken = (id: string, role?: string): string => {
    return jwt.sign({ id, role }, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.expiresIn,
    } as jwt.SignOptions);
};

export const generateRefreshToken = (id: string): string => {
    return jwt.sign({ id }, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.refreshExpiresIn,
    } as jwt.SignOptions);
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_CONFIG.secret);
    } catch (error) {
        throw new Error('Geçersiz token');
    }
};