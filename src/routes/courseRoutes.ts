// src/routes/courseRoutes.ts
import { Router } from 'express';
import {
    createCourse,
    getAllPublishedCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    togglePublishStatus,
    getMyCourses,
    getAllCoursesForAdmin
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { validateCourse } from '../middleware/validationMiddleware.js';

const router = Router();

router.get('/my-courses', protect, authorize('Instructor', 'Admin'), getMyCourses);
router.get('/all-courses', protect, authorize('Admin'), getAllCoursesForAdmin);

router.get('/', getAllPublishedCourses);
router.get('/:id', getCourseById);

router.post('/', protect, authorize('Instructor', 'Admin'), upload.single('coverImage'), validateCourse, createCourse);

router.put('/:id/toggle-publish', protect, authorize('Instructor', 'Admin'), togglePublishStatus);
router.put('/:id', protect, authorize('Instructor', 'Admin'), upload.single('coverImage'), updateCourse);
router.delete('/:id', protect, authorize('Instructor', 'Admin'), deleteCourse);

export default router;