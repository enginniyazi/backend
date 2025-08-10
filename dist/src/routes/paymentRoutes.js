// src/routes/paymentRoutes.ts
import { Router } from 'express';
import { createPaymentIntent, confirmPayment } from '../controllers/paymentController.js';
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
 * /api/payment/create-intent:
 *   post:
 *     summary: Yeni bir ödeme niyeti oluşturur
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
 *     responses:
 *       201:
 *         description: Ödeme niyeti başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   description: Stripe Client Secret
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/create-intent', protect, createPaymentIntent);
/**
 * @swagger
 * /api/payment/confirm:
 *   post:
 *     summary: Bir ödeme niyetini onaylar
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
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *                 description: Onaylanacak ödeme niyetinin ID'si
 *                 example: "pi_3NqZ1a2e3f4g5h6i7j8k9l0m"
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
 *                   example: "Payment confirmed successfully"
 *                 paymentIntentStatus:
 *                   type: string
 *                   example: "succeeded"
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/confirm', protect, confirmPayment);
export default router;
