// src/routes/couponRoutes.ts
import { Router } from 'express';
import { createCoupon, getAllCoupons, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Kupon yönetimi işlemleri
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Kupon ID
 *         code:
 *           type: string
 *           description: Kupon kodu
 *         discountType:
 *           type: string
 *           enum: [percentage, fixed]
 *           description: İndirim tipi
 *         discountValue:
 *           type: number
 *           description: İndirim değeri
 *         maxUses:
 *           type: number
 *           description: Maksimum kullanım sayısı
 *         currentUses:
 *           type: number
 *           description: Mevcut kullanım sayısı
 *         expiryDate:
 *           type: string
 *           format: date
 *           description: Son kullanma tarihi
 *         isActive:
 *           type: boolean
 *           description: Kupon aktif mi
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/coupons/validate/{code}:
 *   get:
 *     summary: Kupon kodunu doğrula
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kupon kodu
 *     responses:
 *       200:
 *         description: Kupon geçerli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 coupon:
 *                   $ref: '#/components/schemas/Coupon'
 *                 discountAmount:
 *                   type: number
 *                   description: İndirim miktarı
 *       400:
 *         description: Kupon geçersiz
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Bu kuponun süresi dolmuş."
 *       404:
 *         description: Kupon bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Kupon kodu bulunamadı."
 */
router.get('/validate/:code', validateCoupon);
/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Tüm kuponları getir (Admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kuponlar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coupon'
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
/**
 * @swagger
 * /api/coupons:
 *   post:
 *     summary: Yeni kupon oluştur (Admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountType
 *               - discountValue
 *               - maxUses
 *               - expiryDate
 *             properties:
 *               code:
 *                 type: string
 *                 description: Kupon kodu
 *                 example: "WELCOME50"
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 description: İndirim tipi
 *                 example: "percentage"
 *               discountValue:
 *                 type: number
 *                 description: İndirim değeri
 *                 example: 50
 *               maxUses:
 *                 type: number
 *                 description: Maksimum kullanım sayısı
 *                 example: 100
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Son kullanma tarihi
 *                 example: "2024-12-31"
 *               isActive:
 *                 type: boolean
 *                 description: Kupon aktif mi
 *                 example: true
 *     responses:
 *       201:
 *         description: Kupon başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
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
/**
 * @swagger
 * /api/coupons/{id}:
 *   put:
 *     summary: Kuponu güncelle (Admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kupon ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Kupon kodu
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 description: İndirim tipi
 *               discountValue:
 *                 type: number
 *                 description: İndirim değeri
 *               maxUses:
 *                 type: number
 *                 description: Maksimum kullanım sayısı
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Son kullanma tarihi
 *               isActive:
 *                 type: boolean
 *                 description: Kupon aktif mi
 *     responses:
 *       200:
 *         description: Kupon başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
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
 *         description: Kupon bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/coupons/{id}:
 *   delete:
 *     summary: Kuponu sil (Admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kupon ID
 *     responses:
 *       200:
 *         description: Kupon başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kupon başarıyla silindi."
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
 *         description: Kupon bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Kupon doğrulama herkese açık olabilir (veya giriş yapmış kullanıcıya)
router.get('/validate/:code', validateCoupon);
// Diğer tüm işlemler sadece Admin için
router.use(protect, authorize('Admin'));
router.route('/').post(createCoupon).get(getAllCoupons);
router.route('/:id').put(updateCoupon).delete(deleteCoupon);
export default router;
