// src/routes/instructorRoutes.ts
import { Router } from 'express';
import { applyToBeInstructor, getAllApplications, reviewApplication, getAllInstructorProfiles, updateMyProfile, deleteInstructorProfile, getMyApplication } from '../controllers/instructorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

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