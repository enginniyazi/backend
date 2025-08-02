// src/controllers/applicationController.ts

import { Request, Response, NextFunction } from 'express';
import Application from '../models/applicationModel.js';
import Lead from '../models/leadModel.js';
import { HydratedApplicationDocument } from '../types/applicationTypes.js';
import { HydratedLeadDocument } from '../types/leadTypes.js';

// @desc    Yeni bir başvuru oluşturur
export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, courseId } = req.body;

    try {
        let lead: HydratedLeadDocument | null = await Lead.findOne({ email });

        if (!lead) {
            lead = await Lead.create({ name, email, phone, applications: [] });
        } else {
            if (phone && lead.phone !== phone) lead.phone = phone;
            if (name && lead.name !== name) lead.name = name;
            await lead.save();
        }

        const application: HydratedApplicationDocument = await Application.create({
            lead: lead._id,
            course: courseId,
        });
        
        // Artık 'application._id' TypeScript tarafından tanınıyor. 'unknown' değil.
        lead.applications.push((application as any)._id);
        await lead.save();

        res.status(201).json({ message: 'Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.' });
    } catch (error) {
        next(error);
    }
};
// @desc    Tüm başvuruları listeler (Sadece Admin)
export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const applications = await Application.find({})
            .populate({ path: 'lead', select: 'name email' })
            .populate({ path: 'course', select: 'title' })
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        next(error);
    }
};

// @desc    Bir başvurunun durumunu günceller (Sadece Admin)
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { status, notes } = req.body;
    const applicationId = req.params.id;
    const adminId = req.user!._id;

    try {
        // Önce geçerli bir durum değeri olduğunu kontrol et
        if (!['Submitted', 'Reviewed', 'Contacted', 'Closed'].includes(status)) {
            res.status(400);
            throw new Error('Geçersiz durum değeri. Geçerli değerler: Submitted, Reviewed, Contacted, Closed');
        }

        const application = await Application.findById(applicationId);

        if (!application) {
            res.status(404);
            throw new Error('Başvuru bulunamadı.');
        }

        // 1. Güncel durumu değiştir.
        application.status = status;
        // Eğer not varsa, notları da güncelle.
        if (notes) application.notes = notes;

        // 2. Bu değişikliği, hangi adminin yaptığının kaydıyla birlikte geçmişe ekle.
        application.statusHistory.push({
            status: status,
            changedAt: new Date(),
            changedBy: adminId,
        });

        await application.save();

        res.status(200).json(application);
    } catch (error) {
        next(error);
    }
};