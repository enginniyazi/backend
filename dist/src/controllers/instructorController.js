// src/controllers/instructorController.ts
import InstructorApplication from '../models/instructorApplicationModel.js';
import InstructorProfile from '../models/instructorProfileModel.js';
import User from '../models/userModel.js';
// @desc    Bir kullanıcı eğitmen olmak için başvurur
export const applyToBeInstructor = async (req, res, next) => {
    const { bio, expertise } = req.body;
    const userId = req.user._id;
    try {
        const existingApplication = await InstructorApplication.findOne({ user: userId });
        if (existingApplication) {
            res.status(400);
            throw new Error('Zaten bir eğitmenlik başvurunuz mevcut.');
        }
        const application = await InstructorApplication.create({
            user: userId,
            bio,
            expertise,
            status: 'pending'
        });
        res.status(201).json(application);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Admin tüm eğitmen başvurularını görür
export const getAllApplications = async (req, res, next) => {
    try {
        const applications = await InstructorApplication.find({}).populate('user', 'name email');
        res.status(200).json(applications);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Admin bir başvuruyu onaylar veya reddeder
export const reviewApplication = async (req, res, next) => {
    const { status } = req.body; // 'approved' veya 'rejected'
    const applicationId = req.params.id;
    try {
        if (!['approved', 'rejected'].includes(status)) {
            res.status(400);
            throw new Error("Geçersiz durum. Sadece 'approved' veya 'rejected' olabilir.");
        }
        const application = await InstructorApplication.findById(applicationId);
        if (!application) {
            res.status(404);
            throw new Error('Başvuru bulunamadı.');
        }
        // Önce başvurunun durumunu güncelle
        application.status = status;
        await application.save();
        // EĞER BAŞVURU ONAYLANDIYSA...
        if (status === 'approved') {
            // 1. Kullanıcının rolünü 'Instructor' yap.
            await User.findByIdAndUpdate(application.user, { role: 'Instructor' });
            // 2. Kullanıcıya ait bir InstructorProfile oluştur.
            await InstructorProfile.create({
                user: application.user,
                bio: application.bio,
                expertise: application.expertise,
            });
        }
        res.status(200).json(application);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Kullanıcı kendi başvurusunu görüntüler
export const getMyApplication = async (req, res, next) => {
    const userId = req.user._id;
    try {
        const application = await InstructorApplication.findOne({ user: userId });
        if (!application) {
            res.status(404);
            throw new Error('Başvuru bulunamadı.');
        }
        res.status(200).json(application);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Tüm eğitmen profillerini listeler
export const getAllInstructorProfiles = async (req, res, next) => {
    try {
        const profiles = await InstructorProfile.find({}).populate('user', 'name email');
        res.status(200).json(profiles);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Bir eğitmen kendi profilini günceller
export const updateMyProfile = async (req, res, next) => {
    const { bio, expertise, website, socials } = req.body;
    const userId = req.user._id;
    try {
        const profile = await InstructorProfile.findOneAndUpdate({ user: userId }, { bio, expertise, website, socials }, { new: true, runValidators: true }).populate('user', 'name email');
        if (!profile) {
            res.status(404);
            throw new Error('Güncellenecek eğitmen profili bulunamadı. Önce başvuru yapmalısınız.');
        }
        res.status(200).json(profile);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Admin bir eğitmen profilini siler
export const deleteInstructorProfile = async (req, res, next) => {
    const { id } = req.params; // Bu sefer profile'ın ID'sini alıyoruz, user ID değil.
    try {
        const profile = await InstructorProfile.findById(id);
        if (!profile) {
            res.status(404);
            throw new Error('Profil bulunamadı.');
        }
        // İlgili kullanıcının rolünü tekrar 'Student'a düşürebiliriz (güvenlik için önemli).
        await User.findByIdAndUpdate(profile.user, { role: 'Student' });
        // Profili sil
        await InstructorProfile.findByIdAndDelete(id);
        // TODO: Bu eğitmene ait kurslar varsa ne yapılmalı?
        // Bu, daha karmaşık bir iş mantığı gerektirir. Şimdilik sadece profili siliyoruz.
        res.status(200).json({ message: 'Eğitmen profili başarıyla silindi.' });
    }
    catch (error) {
        next(error);
    }
};
