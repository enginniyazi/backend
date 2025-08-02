// src/routes/campaignRoutes.ts
import { Router } from 'express';
import { createCampaign, getAllCampaigns, getCampaignById, updateCampaign, deleteCampaign } from '../controllers/campaignController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();
// Bu rotaların tümü sadece Admin tarafından erişilebilir.
router.use(protect, authorize('Admin'));

router.route('/').post(createCampaign).get(getAllCampaigns);
router.route('/:id').get(getCampaignById).put(updateCampaign).delete(deleteCampaign);

export default router;