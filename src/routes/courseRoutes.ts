// src/routes/courseRoutes.ts
import { Router } from 'express';
import {
    createCourse,
    getAllPublishedCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    togglePublishStatus,
    getMyCourses,
    getAllCoursesForAdmin
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { validateCourse } from '../middleware/validationMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Kurs yönetimi işlemleri
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Yayınlanmış tüm kursları getir
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Yayınlanmış kurslar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */
router.get('/', getAllPublishedCourses);

/**
 * @swagger
 * /api/courses/my-courses:
 *   get:
 *     summary: Kullanıcının kurslarını getir
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcının kursları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my-courses', protect, authorize('Instructor', 'Admin'), getMyCourses);

/**
 * @swagger
 * /api/courses/all-courses:
 *   get:
 *     summary: Tüm kursları getir (Admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tüm kurslar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Yetki hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/all-courses', protect, authorize('Admin'), getAllCoursesForAdmin);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: ID'ye göre kurs getir
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kurs ID
 *     responses:
 *       200:
 *         description: Kurs başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Kurs bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getCourseById);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Yeni kurs oluştur
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Kurs başlığı
 *                 example: "JavaScript Temelleri"
 *               description:
 *                 type: string
 *                 description: Kurs açıklaması
 *                 example: "JavaScript programlama dilinin temellerini öğrenin"
 *               price:
 *                 type: number
 *                 description: Kurs fiyatı
 *                 example: 99.99
 *               category:
 *                 type: string
 *                 description: Kategori ID
 *                 example: "507f1f77bcf86cd799439011"
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Kurs kapak resmi
 *     responses:
 *       201:
 *         description: Kurs başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation hatası
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
 *       403:
 *         description: Yetki hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', protect, authorize('Instructor', 'Admin'), upload.single('coverImage'), validateCourse, createCourse);

/**
 * @swagger
 * /api/courses/{id}/toggle-publish:
 *   put:
 *     summary: Kurs yayın durumunu değiştir
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kurs ID
 *     responses:
 *       200:
 *         description: Kurs yayın durumu başarıyla değiştirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Yetki hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Kurs bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/toggle-publish', protect, authorize('Instructor', 'Admin'), togglePublishStatus);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Kursu güncelle
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kurs ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Kurs başlığı
 *               description:
 *                 type: string
 *                 description: Kurs açıklaması
 *               price:
 *                 type: number
 *                 description: Kurs fiyatı
 *               category:
 *                 type: string
 *                 description: Kategori ID
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Kurs kapak resmi
 *     responses:
 *       200:
 *         description: Kurs başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Yetki hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Kurs bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', protect, authorize('Instructor', 'Admin'), upload.single('coverImage'), updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Kursu sil
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kurs ID
 *     responses:
 *       200:
 *         description: Kurs başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kurs başarıyla silindi."
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Yetki hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Kurs bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', protect, authorize('Instructor', 'Admin'), deleteCourse);



export default router;