// src/routes/categoryRoutes.ts

import { Router } from 'express';
import { 
    createCategory, 
    getAllCategories, 
    getCategoryById, 
    updateCategory, 
    deleteCategory,
    getCategoryWithCourses 
} from '../controllers/categoryController.js';

// Auth middleware'lerini de import edeceğiz
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

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