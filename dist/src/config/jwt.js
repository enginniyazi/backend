// src/config/jwt.ts
import jwt from 'jsonwebtoken';
export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'test-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
export const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.expiresIn,
    });
};
export const generateRefreshToken = (id) => {
    return jwt.sign({ id }, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.refreshExpiresIn,
    });
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_CONFIG.secret);
    }
    catch (error) {
        throw new Error('Geçersiz token');
    }
};
