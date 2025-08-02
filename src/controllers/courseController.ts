// src/controllers/courseController.ts

import { Request, Response, NextFunction } from 'express';
import Course from '../models/courseModel.js';
import fs from 'fs';
import path from 'path';

// --- YARDIMCI FONKSİYON ---
// Tekrar eden populate sorgularını tek bir yerde toplamak, kodu temizler.
const populateOptions = [
    { path: 'instructor', select: 'name email' },
    { path: 'categories', select: 'name' }
];

// @desc    Yeni bir kurs oluşturur
export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, categories, price } = req.body;
    
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Lütfen bir kapak resmi yükleyin.');
        }

        const course = await Course.create({
            title,
            description,
            categories,
            price,
            instructor: req.user!._id,
            coverImage: req.file.path, // Artık dosya yolu var
            isPublished: false, // Varsayılan olarak taslak (draft)
        });
        const responseCourse = await Course.findById(course._id)
            .populate({ path: 'instructor', select: 'name email' })
            .populate({ path: 'categories', select: 'name' });
        res.status(201).json(responseCourse);
    } catch (error) {
        next(error);
    }
};

// @desc    Tüm (yayınlanmış) kursları listeler
export const getAllPublishedCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .populate(populateOptions);
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

// @desc    Tek bir kursu ID ile getirir
export const getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate(populateOptions);

        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }

        // Güvenlik Notu: Eğer kurs yayınlanmamışsa ve kullanıcı admin/eğitmen değilse gösterme.
        // Bu mantığı daha da geliştirebiliriz. Şimdilik temel haliyle bırakalım.
        if (!course.isPublished && req.user?.role !== 'Admin' && course.instructor?.toString() !== req.user?._id.toString()) {
             res.status(403);
             throw new Error('Bu kursa erişim yetkiniz yok.');
        }

        res.status(200).json(course);
    } catch (error) {
        next(error);
    }
};

// @desc    Bir kursu günceller
export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }

        if (!course.instructor) {
            res.status(500); // Bu bir sunucu hatasıdır, çünkü verimiz tutarsız demektir.
            throw new Error('Kurs verisi bozuk: Eğitmen bilgisi eksik.');
        }

        // Yetki kontrolü: Sadece kursun kendi eğitmeni veya admin güncelleyebilir
        if (course.instructor.toString() !== req.user!._id.toString() && req.user!.role !== 'Admin') {
            res.status(403);
            throw new Error('Bu işlem için yetkiniz yok.');
        }

        // Verileri güncelle
        Object.assign(course, req.body);

        // Yeni bir kapak resmi yüklendiyse
        if (req.file) {
            // Eski resmi sil
            if (course.coverImage) {
                fs.unlink(path.join(process.cwd(), course.coverImage), err => {
                    if (err) console.error("Eski kurs resmi silinemedi:", err);
                });
            }
            course.coverImage = req.file.path;
        }

        const updatedCourse = await course.save();
        const responseCourse = await Course.findById(updatedCourse._id)
            .populate({ path: 'instructor', select: 'name email' })
            .populate({ path: 'categories', select: 'name' });
        res.status(200).json(responseCourse);
    } catch (error) {
        next(error);
    }
};

// @desc    Bir kursu siler
export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }

        if (!course.instructor) {
            res.status(500); // Bu bir sunucu hatasıdır, çünkü verimiz tutarsız demektir.
            throw new Error('Kurs verisi bozuk: Eğitmen bilgisi eksik.');
        }

        if (course.instructor.toString() !== req.user!._id.toString() && req.user!.role !== 'Admin') {
            res.status(403);
            throw new Error('Bu işlem için yetkiniz yok.');
        }

        // Kurs resmini sunucudan sil
        if (course.coverImage) {
             fs.unlink(path.join(process.cwd(), course.coverImage), err => {
                if (err) console.error("Kurs resmi silinemedi:", err);
            });
        }
        
        await Course.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Kurs başarıyla silindi.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Bir kursun yayın durumunu değiştirir (Instructor & Admin)
export const togglePublishStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }
        if (!course.instructor) { // Veri bütünlüğü kontrolü
            res.status(500);
            throw new Error('Kurs verisi bozuk: Eğitmen bilgisi eksik.');
        }

        if (course.instructor.toString() !== req.user!._id.toString() && req.user!.role !== 'Admin') {
            res.status(403);
            throw new Error('Bu işlem için yetkiniz yok.');
        }

        course.isPublished = !course.isPublished;
        const updatedCourse = await course.save();
        res.status(200).json(updatedCourse);
    } catch (error) {
        next(error);
    }
};

// @desc    Giriş yapmış kullanıcının tüm kurslarını getirir (Yönetim Paneli için)
export const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Bu endpoint sadece giriş yapmış kullanıcılar için olduğundan, req.user var olacaktır.
        const filter: any = { instructor: req.user!._id };
        
        if (req.query.status === 'published') filter.isPublished = true;
        if (req.query.status === 'draft') filter.isPublished = false;

        const courses = await Course.find(filter).populate('categories', 'name');
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

// @desc    Tüm kullanıcıların tüm yazılarını getirir (Admin Paneli için)
export const getAllCoursesForAdmin = async (req: Request, res: Response, next: NextFunction) => {
     try {
        const filter: any = {};
        
        if (req.query.status === 'published') filter.isPublished = true;
        if (req.query.status === 'draft') filter.isPublished = false;
        
        const courses = await Course.find(filter)
            .populate('instructor', 'name')
            .populate('categories', 'name');

        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};