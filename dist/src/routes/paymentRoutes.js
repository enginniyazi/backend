// src/routes/paymentRoutes.ts
import { Router } from 'express';
import { createPaymentForm, confirmPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Ödeme işlemleri
 */
/**
 * @swagger
 * /api/payment/create-payment-form:
 *   post:
 *     summary: İyzipay ödeme formu oluşturur
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Ödeme tutarı (örneğin, 100.00 TL için 100)
 *                 example: 99.99
 *               courseId:
 *                 type: string
 *                 description: Kurs ID'si
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Ödeme formu başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentForm:
 *                   type: string
 *                   description: İyzipay ödeme formu HTML içeriği
 *                 token:
 *                   type: string
 *                   description: Ödeme token'ı
 *                 conversationId:
 *                   type: string
 *                   description: Konuşma ID'si
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/create-payment-form', protect, createPaymentForm);
/**
 * @swagger
 * /api/payment/confirm-payment:
 *   post:
 *     summary: İyzipay ödemesini onaylar
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: İyzipay ödeme token'ı
 *                 example: "token_123456789"
 *               courseId:
 *                 type: string
 *                 description: Kurs ID'si
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Ödeme başarıyla onaylandı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment confirmed and enrollment successful"
 *                 paymentStatus:
 *                   type: string
 *                   example: "SUCCESS"
 *                 conversationId:
 *                   type: string
 *                   example: "conv_123456789"
 *                 enrollment:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     course:
 *                       type: string
 *                     paymentStatus:
 *                       type: string
 *                     paymentAmount:
 *                       type: number
 *                     paymentMethod:
 *                       type: string
 *                     paymentDate:
 *                       type: string
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/confirm-payment', protect, confirmPayment);
export default router;
