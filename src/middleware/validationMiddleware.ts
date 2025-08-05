// src/middleware/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';

// Basit email validation
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Basit password validation
export const validatePassword = (password: string): boolean => {
    return password.length >= 6;
};

// User registration validation
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const errors: string[] = [];

    if (!name || name.trim().length < 2) {
        errors.push('İsim en az 2 karakter olmalıdır.');
    }

    if (!email || !validateEmail(email)) {
        errors.push('Geçerli bir e-posta adresi giriniz.');
    }

    if (!password || !validatePassword(password)) {
        errors.push('Şifre en az 6 karakter olmalıdır.');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation hatası',
            errors,
        });
    }

    next();
};

// User login validation
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const errors: string[] = [];

    if (!email || !validateEmail(email)) {
        errors.push('Geçerli bir e-posta adresi giriniz.');
    }

    if (!password) {
        errors.push('Şifre gereklidir.');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation hatası',
            errors,
        });
    }

    next();
};

// Course creation validation
export const validateCourse = (req: Request, res: Response, next: NextFunction) => {
    // Dosya yükleme sırasında req.body'nin varlığını kontrol edelim
    if (!req.body) {
        return res.status(400).json({
            message: 'Validation hatası',
            errors: ['İstek gövdesi (body) bulunamadı.'],
        });
    }

    const { title, description, price } = req.body;
    let { categories } = req.body; // 'categories'i 'let' ile tanımlıyoruz
    const errors: string[] = [];

    // --- BU, TÜM SORUNU ÇÖZEN BLOKTUR ---
    // Gelen 'categories' verisini her zaman bir diziye çeviriyoruz.
    if (categories && !Array.isArray(categories)) {
        // Eğer 'categories' varsa ama bir dizi değilse (yani tek bir string ise),
        // onu tek elemanlı bir diziye dönüştür.
        categories = [categories];
    } else if (!categories) {
        // Eğer 'categories' hiç gelmediyse, boş bir dizi olarak ata.
        // Bu, aşağıdaki 'categories.length === 0' kontrolünün çalışmasını sağlar.
        categories = [];
    }
    // ------------------------------------------

    if (!title || title.trim().length < 3) {
        errors.push('Kurs başlığı en az 3 karakter olmalıdır.');
    }

    if (!description || description.trim().length < 10) {
        errors.push('Kurs açıklaması en az 10 karakter olmalıdır.');
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
        errors.push('Geçerli bir fiyat giriniz.');
    }

    // Artık 'categories'in her zaman bir dizi olduğundan eminiz.
    if (categories.length === 0) {
        errors.push('En az bir kategori seçimi gereklidir.');
    } else {
        // Bonus: Dizideki her bir elemanın geçerli bir MongoDB ID'si olup olmadığını da kontrol edebiliriz.
        // (Bu adım şimdilik isteğe bağlı)
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Lütfen aşağıdaki hataları düzeltin:',
            errors,
        });
    }

    // Validasyon başarılıysa, normalleştirilmiş 'categories' dizisini
    // bir sonraki adıma (controller'a) aktarmak için req.body'yi güncelleyebiliriz.
    req.body.categories = categories;

    next();
};