// src/routes/authRoutes.ts

import { Router } from 'express';
import { registerUser, loginUser, updateUserAvatar } from '../controllers/authController.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegistration, validateLogin } from '../middleware/validationMiddleware.js';

const router = Router();

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.put('/profile/avatar', protect, upload.single('avatar'), updateUserAvatar);

export default router;