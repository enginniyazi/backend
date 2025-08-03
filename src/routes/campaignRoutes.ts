// src/routes/campaignRoutes.ts
import { Router } from 'express';
import { createCampaign, getAllCampaigns, getCampaignById, updateCampaign, deleteCampaign } from '../controllers/campaignController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Kampanya yönetimi işlemleri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Kampanya ID
 *         title:
 *           type: string
 *           description: Kampanya başlığı
 *         description:
 *           type: string
 *           description: Kampanya açıklaması
 *         discountPercentage:
 *           type: number
 *           description: İndirim yüzdesi
 *         startDate:
 *           type: string
 *           format: date
 *           description: Başlangıç tarihi
 *         endDate:
 *           type: string
 *           format: date
 *           description: Bitiş tarihi
 *         courseId:
 *           type: string
 *           description: Kampanya uygulanacak kurs ID
 *         isActive:
 *           type: boolean
 *           description: Kampanya aktif mi
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Tüm kampanyaları getir
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kampanyalar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campaign'
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
 * /api/campaigns:
 *   post:
 *     summary: Yeni kampanya oluştur
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - discountPercentage
 *               - startDate
 *               - endDate
 *               - courseId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Kampanya başlığı
 *                 example: "Yaz Kampanyası"
 *               description:
 *                 type: string
 *                 description: Kampanya açıklaması
 *                 example: "Yaz aylarında %50 indirim"
 *               discountPercentage:
 *                 type: number
 *                 description: İndirim yüzdesi
 *                 example: 50
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Başlangıç tarihi
 *                 example: "2024-06-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Bitiş tarihi
 *                 example: "2024-08-31"
 *               courseId:
 *                 type: string
 *                 description: Kampanya uygulanacak kurs ID
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Kampanya başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
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
 * /api/campaigns/{id}:
 *   get:
 *     summary: ID'ye göre kampanya getir
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kampanya ID
 *     responses:
 *       200:
 *         description: Kampanya başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
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
 *         description: Kampanya bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/campaigns/{id}:
 *   put:
 *     summary: Kampanyayı güncelle
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kampanya ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Kampanya başlığı
 *               description:
 *                 type: string
 *                 description: Kampanya açıklaması
 *               discountPercentage:
 *                 type: number
 *                 description: İndirim yüzdesi
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Başlangıç tarihi
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Bitiş tarihi
 *               courseId:
 *                 type: string
 *                 description: Kampanya uygulanacak kurs ID
 *     responses:
 *       200:
 *         description: Kampanya başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
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
 *         description: Kampanya bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/campaigns/{id}:
 *   delete:
 *     summary: Kampanyayı sil
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kampanya ID
 *     responses:
 *       200:
 *         description: Kampanya başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kampanya başarıyla silindi."
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
 *         description: Kampanya bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Bu rotaların tümü sadece Admin tarafından erişilebilir.
router.use(protect, authorize('Admin'));

router.route('/').post(createCampaign).get(getAllCampaigns);
router.route('/:id').get(getCampaignById).put(updateCampaign).delete(deleteCampaign);

export default router;