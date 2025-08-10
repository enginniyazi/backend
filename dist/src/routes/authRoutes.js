// src/routes/authRoutes.ts
import { Router } from 'express';
import { registerUser, loginUser, updateUserAvatar, updateUserProfile, getAllUsers, getUserById, updateUserById, deleteUserById } from '../controllers/authController.js';
import upload, { handleUploadErrors, trackFileUpload } from '../middleware/uploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
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
 *                 example: "test@example.com"
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
router.put('/profile/avatar', protect, upload.single('avatar'), handleUploadErrors, trackFileUpload, updateUserAvatar);
/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Giriş yapmış kullanıcının profil bilgilerini günceller
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kullanıcının yeni adı ve soyadı
 *                 example: "Engin Niyazi Ergül"
 *     responses:
 *       200:
 *         description: Profil bilgileri başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Yetkilendirme hatası (token yok veya geçersiz)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Kullanıcı bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile', protect, updateUserProfile);
/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Tüm kullanıcıları listeler
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcıların listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin yetkisi gerekli
 */
router.get('/', protect, authorize('Admin'), getAllUsers);
/**
 * @swagger
 * /api/auth/{id}:
 *   get:
 *     summary: Tek bir kullanıcıyı ID ile getirir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID'si
 *     responses:
 *       200:
 *         description: Kullanıcı detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Kullanıcı bulunamadı
*/
router.get('/:id', protect, authorize('Admin'), getUserById);
/**
 * @swagger
 * /api/auth/{id}:
 *   put:
 *     summary: Bir kullanıcının bilgilerini günceller
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Student, Instructor, Admin]
 *     responses:
 *       200:
 *         description: Güncellenmiş kullanıcı bilgileri
 */
router.put('/:id', protect, authorize('Admin'), updateUserById);
/**
 * @swagger
 * /api/auth/{id}:
 *    delete:
 *     summary: Bir kullanıcıyı siler
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla silindi
 */
router.delete('/:id', protect, authorize('Admin'), deleteUserById);
export default router;
