const store = {};
export const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
    return (req, res, next) => {
        const key = req.ip || 'unknown';
        const now = Date.now();
        if (!store[key] || now > store[key].resetTime) {
            store[key] = {
                count: 1,
                resetTime: now + windowMs,
            };
        }
        else {
            store[key].count++;
        }
        if (store[key].count > max) {
            return res.status(429).json({
                message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
            });
        }
        // Rate limit bilgilerini header'a ekle
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count));
        res.setHeader('X-RateLimit-Reset', store[key].resetTime);
        next();
    };
};
// Auth endpoint'leri için daha sıkı rate limiting
export const authRateLimit = rateLimit(15 * 60 * 1000, 5); // 15 dakikada 5 istek
export const generalRateLimit = rateLimit(15 * 60 * 1000, 100); // 15 dakikada 100 istek 
