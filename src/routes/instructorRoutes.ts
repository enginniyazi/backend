// src/routes/instructorRoutes.ts
import { Router } from 'express';
import { applyToBeInstructor, getAllApplications, reviewApplication, getAllInstructorProfiles, updateMyProfile, deleteInstructorProfile, getMyApplication } from '../controllers/instructorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Instructors
 *   description: Eğitmen yönetimi ve başvuru işlemleri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InstructorApplication:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Başvuru ID
 *         user:
 *           $ref: '#/components/schemas/User'
 *         bio:
 *           type: string
 *           description: Eğitmen biyografisi
 *         expertise:
 *           type: string
 *           description: Uzmanlık alanları
 *         experience:
 *           type: string
 *           description: Deneyim süresi
 *         education:
 *           type: string
 *           description: Eğitim bilgileri
 *         status:
 *           type: string
 *           enum: [Submitted, Reviewed, Contacted, Closed]
 *           description: Başvuru durumu
 *         adminNotes:
 *           type: string
 *           description: Admin notları
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/instructors:
 *   get:
 *     summary: Tüm onaylanmış eğitmen profillerini getir
 *     tags: [Instructors]
 *     responses:
 *       200:
 *         description: Eğitmen profilleri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InstructorApplication'
 */
router.route('/').get(getAllInstructorProfiles)

/**
 * @swagger
 * /api/instructors/apply:
 *   post:
 *     summary: Eğitmen olmak için başvuru yap
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bio
 *               - expertise
 *               - experience
 *               - education
 *             properties:
 *               bio:
 *                 type: string
 *                 description: Eğitmen biyografisi
 *                 example: "Deneyimli yazılım geliştirici"
 *               expertise:
 *                 type: string
 *                 description: Uzmanlık alanları
 *                 example: "JavaScript, React, Node.js"
 *               experience:
 *                 type: string
 *                 description: Deneyim süresi
 *                 example: "5+ yıl"
 *               education:
 *                 type: string
 *                 description: Eğitim bilgileri
 *                 example: "Bilgisayar Mühendisliği"
 *     responses:
 *       201:
 *         description: Başvuru başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstructorApplication'
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
 */
router.route('/apply').post(protect, applyToBeInstructor);

/**
 * @swagger
 * /api/instructors/applications:
 *   get:
 *     summary: Tüm eğitmen başvurularını getir (Admin)
 *     tags: [Instructors]
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
 *                 $ref: '#/components/schemas/InstructorApplication'
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
router.route('/applications').get(protect, authorize('Admin'), getAllApplications);

/**
 * @swagger
 * /api/instructors/applications/{id}:
 *   put:
 *     summary: Eğitmen başvurusunu incele (Admin)
 *     tags: [Instructors]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Submitted, Reviewed, Contacted, Closed]
 *                 description: Başvuru durumu
 *               adminNotes:
 *                 type: string
 *                 description: Admin notları
 *     responses:
 *       200:
 *         description: Başvuru başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstructorApplication'
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
router.route('/applications/:id').put(protect, authorize('Admin'), reviewApplication);

/**
 * @swagger
 * /api/instructors/my-application:
 *   get:
 *     summary: Kendi eğitmen başvurumu getir
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başvuru başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstructorApplication'
 *       401:
 *         description: Yetkilendirme hatası
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
router.route('/my-application').get(protect, getMyApplication);

/**
 * @swagger
 * /api/instructors/profile/me:
 *   put:
 *     summary: Kendi eğitmen profilimi güncelle
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 description: Eğitmen biyografisi
 *               expertise:
 *                 type: string
 *                 description: Uzmanlık alanları
 *               experience:
 *                 type: string
 *                 description: Deneyim süresi
 *               education:
 *                 type: string
 *                 description: Eğitim bilgileri
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstructorApplication'
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
router.route('/profile/me').put(protect, authorize('Instructor'), updateMyProfile);

/**
 * @swagger
 * /api/instructors/profile/{id}:
 *   delete:
 *     summary: Eğitmen profilini sil (Admin)
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profil ID
 *     responses:
 *       200:
 *         description: Profil başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Eğitmen profili başarıyla silindi."
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
 *         description: Profil bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/profile/:id').delete(protect, authorize('Admin'), deleteInstructorProfile);

router.route('/').get(getAllInstructorProfiles)

// Kullanıcılar (Student rolündekiler) eğitmen olmak için bu rotayı kullanır.
router.route('/apply').post(protect, applyToBeInstructor);

// Adminler tüm başvuruları bu rotadan görür.
router.route('/applications').get(protect, authorize('Admin'), getAllApplications);

// Adminler bir başvuruyu (ID ile) bu rotadan onaylar veya reddeder.
router.route('/applications/:id').put(protect, authorize('Admin'), reviewApplication);

// Kullanıcı kendi başvurusunu görüntüler
router.route('/my-application').get(protect, getMyApplication);

// Bir eğitmen kendi profilini günceller
router.route('/profile/me').put(protect, authorize('Instructor'), updateMyProfile);

// Admin bir profili siler (profilin _id'si ile)
router.route('/profile/:id').delete(protect, authorize('Admin'), deleteInstructorProfile);

// Herkes onaylanmış eğitmenlerin profillerini listeleyebilir
router.route('/').get(getAllInstructorProfiles);

export default router;