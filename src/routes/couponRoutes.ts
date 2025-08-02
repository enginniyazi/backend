// src/routes/couponRoutes.ts
import { Router } from 'express';
import { createCoupon, getAllCoupons, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Kupon doğrulama herkese açık olabilir (veya giriş yapmış kullanıcıya)
router.get('/validate/:code', validateCoupon);

// Diğer tüm işlemler sadece Admin için
router.use(protect, authorize('Admin'));

router.route('/').post(createCoupon).get(getAllCoupons);
router.route('/:id').put(updateCoupon).delete(deleteCoupon);

export default router;