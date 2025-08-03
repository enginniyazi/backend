// src/routes/applicationRoutes.ts

import { Router } from 'express';
import {
    createApplication,
    getAllApplications,
    updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Kurs başvuru işlemleri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Başvuru ID
 *         courseId:
 *           type: string
 *           description: Kurs ID
 *         name:
 *           type: string
 *           description: Başvuran kişinin adı
 *         email:
 *           type: string
 *           format: email
 *           description: E-posta adresi
 *         phone:
 *           type: string
 *           description: Telefon numarası
 *         message:
 *           type: string
 *           description: Başvuru mesajı
 *         status:
 *           type: string
 *           enum: [Submitted, Reviewed, Contacted, Closed]
 *           description: Başvuru durumu
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Yeni kurs başvurusu oluştur
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - name
 *               - email
 *               - message
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: Kurs ID
 *                 example: "507f1f77bcf86cd799439011"
 *               name:
 *                 type: string
 *                 description: Başvuran kişinin adı
 *                 example: "Ahmet Yılmaz"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-posta adresi
 *                 example: "ahmet@example.com"
 *               phone:
 *                 type: string
 *                 description: Telefon numarası
 *                 example: "+90 555 123 4567"
 *               message:
 *                 type: string
 *                 description: Başvuru mesajı
 *                 example: "Bu kursa katılmak istiyorum"
 *     responses:
 *       201:
 *         description: Başvuru başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Validation hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/').post(createApplication);

/**
 * @swagger
 * /api/applications/all:
 *   get:
 *     summary: Tüm başvuruları getir (Admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başvurular başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
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
router.route('/all').get(protect, authorize('Admin'), getAllApplications);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   put:
 *     summary: Başvuru durumunu güncelle (Admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Başvuru ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Submitted, Reviewed, Contacted, Closed]
 *                 description: Başvuru durumu
 *                 example: "Contacted"
 *     responses:
 *       200:
 *         description: Başvuru durumu başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
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
 *       404:
 *         description: Başvuru bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/:id/status').put(protect, authorize('Admin'), updateApplicationStatus);

// "Bilgi Al" formu bu rotayı kullanacak (Herkese Açık)
router.route('/').post(createApplication);

// Adminler tüm başvuruları bu rotadan görecek
router.route('/all').get(protect, authorize('Admin'), getAllApplications);

// Adminler bir başvurunun durumunu bu rotadan güncelleyecek
router.route('/:id/status').put(protect, authorize('Admin'), updateApplicationStatus);

export default router;