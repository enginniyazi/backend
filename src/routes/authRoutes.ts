// src/routes/authRoutes.ts

import { Router } from 'express';
import { registerUser, loginUser, updateUserAvatar } from '../controllers/authController.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js'; // Henüz oluşturmadık ama yeri hazır

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile/avatar', protect, upload.single('avatar'), updateUserAvatar);

export default router;