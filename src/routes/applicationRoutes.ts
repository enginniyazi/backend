// src/routes/applicationRoutes.ts

import { Router } from 'express';
import {
    createApplication,
    getAllApplications,
    updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// "Bilgi Al" formu bu rotayı kullanacak (Herkese Açık)
router.route('/').post(createApplication);

// Adminler tüm başvuruları bu rotadan görecek
router.route('/all').get(protect, authorize('Admin'), getAllApplications);

// Adminler bir başvurunun durumunu bu rotadan güncelleyecek
router.route('/:id/status').put(protect, authorize('Admin'), updateApplicationStatus);

export default router;