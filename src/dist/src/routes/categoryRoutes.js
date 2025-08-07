// src/routes/categoryRoutes.ts
import { Router } from 'express';
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, getCategoryWithCourses } from '../controllers/categoryController.js';
// Auth middleware'lerini de import edeceğiz
import { protect, authorize } from '../middleware/authMiddleware.js';
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Kategori yönetimi işlemleri
 */
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Tüm kategorileri getir
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Kategoriler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Yeni kategori oluştur
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kategori adı
 *                 example: "Programlama"
 *               description:
 *                 type: string
 *                 description: Kategori açıklaması
 *                 example: "Programlama dilleri ve teknolojileri"
 *     responses:
 *       201:
 *         description: Kategori başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
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
router.route('/')
    .post(protect, authorize('Admin'), createCategory) // Yeni kategori oluşturma (Sadece Admin)
    .get(getAllCategories); // Tüm kategorileri listeleme (Herkese Açık)
/**
 * @swagger
 * /api/categories/{id}/withcourses:
 *   get:
 *     summary: Kategoriyi kurslarıyla birlikte getir
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kategori ID
 *     responses:
 *       200:
 *         description: Kategori ve kursları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       404:
 *         description: Kategori bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/:id/withcourses')
    .get(getCategoryWithCourses); // Tek bir kategoriyi kurslarıyla birlikte getirme (Herkese Açık)
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: ID'ye göre kategori getir
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kategori ID
 *     responses:
 *       200:
 *         description: Kategori başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Kategori bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Kategoriyi güncelle
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kategori ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kategori adı
 *               description:
 *                 type: string
 *                 description: Kategori açıklaması
 *     responses:
 *       200:
 *         description: Kategori başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
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
 *         description: Kategori bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Kategoriyi sil
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kategori ID
 *     responses:
 *       200:
 *         description: Kategori başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kategori başarıyla silindi."
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
 *         description: Kategori bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/:id')
    .get(getCategoryById) // Tek kategori getirme (Herkese Açık)
    .put(protect, authorize('Admin'), updateCategory) // Kategori güncelleme (Sadece Admin)
    .delete(protect, authorize('Admin'), deleteCategory); // Kategori silme (Sadece Admin)
// Rotaları gruplayarak daha okunaklı hale getiriyoruz
router.route('/')
    .post(protect, authorize('Admin'), createCategory) // Yeni kategori oluşturma (Sadece Admin)
    .get(getAllCategories); // Tüm kategorileri listeleme (Herkese Açık)
router.route('/:id/withcourses')
    .get(getCategoryWithCourses); // Tek bir kategoriyi kurslarıyla birlikte getirme (Herkese Açık)
router.route('/:id')
    .get(getCategoryById) // Tek kategori getirme (Herkese Açık)
    .put(protect, authorize('Admin'), updateCategory) // Kategori güncelleme (Sadece Admin)
    .delete(protect, authorize('Admin'), deleteCategory); // Kategori silme (Sadece Admin)
export default router;
