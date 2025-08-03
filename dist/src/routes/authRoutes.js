// src/routes/authRoutes.ts
import { Router } from 'express';
import { registerUser, loginUser, updateUserAvatar } from '../controllers/authController.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegistration, validateLogin } from '../middleware/validationMiddleware.js';
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Kullanıcı kimlik doğrulama işlemleri
 */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kullanıcı adı
 *                 example: "Ahmet Yılmaz"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-posta adresi
 *                 example: "ahmet@example.com"
 *               password:
 *                 type: string
 *                 description: Şifre (en az 6 karakter)
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [Student, Instructor, Admin]
 *                 description: Kullanıcı rolü
 *                 example: "Student"
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Validation hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateRegistration, registerUser);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-posta adresi
 *                 example: "ahmet@example.com"
 *               password:
 *                 type: string
 *                 description: Şifre
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: Geçersiz kimlik bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateLogin, loginUser);
/**
 * @swagger
 * /api/auth/profile/avatar:
 *   put:
 *     summary: Kullanıcı profil resmini güncelle
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Profil resmi dosyası
 *     responses:
 *       200:
 *         description: Profil resmi başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profil resmi başarıyla güncellendi."
 *                 avatar:
 *                   type: string
 *                   description: Yeni avatar URL'i
 *       400:
 *         description: Dosya yükleme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile/avatar', protect, upload.single('avatar'), updateUserAvatar);
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.put('/profile/avatar', protect, upload.single('avatar'), updateUserAvatar);
export default router;
