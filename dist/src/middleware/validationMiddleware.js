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
    // Dosya yükleme sırasında req.body'nin varlığını kontrol edelim
    if (!req.body) {
        return res.status(400).json({
            message: 'Validation hatası',
            errors: ['İstek gövdesi (body) bulunamadı.'],
        });
    }
    const { title, description, price } = req.body;
    let { categories } = req.body; // 'categories'i 'let' ile tanımlıyoruz
    const errors = [];
    // --- BU, TÜM SORUNU ÇÖZEN BLOKTUR ---
    // Gelen 'categories' verisini her zaman bir diziye çeviriyoruz.
    if (categories && !Array.isArray(categories)) {
        // Eğer 'categories' varsa ama bir dizi değilse (yani tek bir string ise),
        // onu tek elemanlı bir diziye dönüştür.
        categories = [categories];
    }
    else if (!categories) {
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
    }
    else {
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
// Course enrollment validation
export const validateEnrollment = (req, res, next) => {
    const { id } = req.params; // Assuming 'id' is a course ID from params
    const errors = [];
    // A simple check for MongoDB ID format. 
    // For a more robust check, consider using a library like 'mongoose.Types.ObjectId.isValid(id)'
    // or a dedicated validation library.
    if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
        errors.push('Geçersiz kurs ID\'si.');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation hatası',
            errors,
        });
    }
    next();
};
