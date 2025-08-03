// src/controllers/campaignController.ts
import Campaign from '../models/campaignModel.js';
import Course from '../models/courseModel.js';
// @desc    Yeni bir kampanya oluşturur (Admin)
export const createCampaign = async (req, res, next) => {
    try {
        const { title, description, startDate, endDate, featuredCourses } = req.body;
        // Required alan kontrolü
        if (!title || !description || !startDate || !endDate || !featuredCourses) {
            res.status(400);
            throw new Error('Tüm alanlar zorunludur.');
        }
        // Tarih kontrolü
        if (new Date(startDate) >= new Date(endDate)) {
            res.status(400);
            throw new Error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
        }
        // Geçerli kurs ID'si kontrolü
        for (const courseId of featuredCourses) {
            const course = await Course.findById(courseId);
            if (!course) {
                res.status(400);
                throw new Error(`${courseId} ID'li kurs bulunamadı.`);
            }
        }
        const campaign = await Campaign.create(req.body);
        res.status(201).json(campaign);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Tüm kampanyaları listeler (Admin)
export const getAllCampaigns = async (req, res, next) => {
    try {
        const campaigns = await Campaign.find({ isActive: true }).populate('featuredCourses', 'title');
        res.status(200).json(campaigns);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Tek bir kampanyayı ID ile getirir (Admin)
export const getCampaignById = async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id).populate('featuredCourses', 'title');
        if (!campaign) {
            res.status(404);
            throw new Error('Kampanya bulunamadı.');
        }
        res.status(200).json(campaign);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Bir kampanyayı günceller (Admin)
export const updateCampaign = async (req, res, next) => {
    try {
        const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!campaign) {
            res.status(404);
            throw new Error('Kampanya bulunamadı.');
        }
        res.status(200).json(campaign);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Bir kampanyayı siler (Admin)
export const deleteCampaign = async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            res.status(404);
            throw new Error('Kampanya bulunamadı.');
        }
        await Campaign.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Kampanya başarıyla silindi.' });
    }
    catch (error) {
        next(error);
    }
};
