// src/middleware/uploadMiddleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Hata: Sadece resim dosyaları!'));
    }
};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Hangi rotadan geliyorsa, ona göre bir alt klasör oluştur/kullan
        let dir = 'uploads/';
        if (req.originalUrl.includes('/users/profile/avatar')) {
            dir += 'avatars/';
        }
        else if (req.originalUrl.includes('/courses')) {
            dir += 'course-covers/';
        }
        // Klasör yoksa oluştur
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});
export default upload;
