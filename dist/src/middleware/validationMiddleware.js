// Basit email validation
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// Basit password validation
export const validatePassword = (password) => {
    return password.length >= 6;
};
// User registration validation
export const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];
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
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
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
export const validateCourse = (req, res, next) => {
    // Dosya yükleme sırasında req.body undefined olabilir
    if (!req.body) {
        return res.status(400).json({
            message: 'Validation hatası',
            errors: ['Request body bulunamadı.'],
        });
    }
    const { title, description, price, category } = req.body;
    const errors = [];
    if (!title || title.trim().length < 3) {
        errors.push('Kurs başlığı en az 3 karakter olmalıdır.');
    }
    if (!description || description.trim().length < 10) {
        errors.push('Kurs açıklaması en az 10 karakter olmalıdır.');
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
        errors.push('Geçerli bir fiyat giriniz.');
    }
    if (!category) {
        errors.push('Kategori seçimi gereklidir.');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation hatası',
            errors,
        });
    }
    next();
};
