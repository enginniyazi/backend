// src/controllers/courseController.ts

import { Request, Response, NextFunction } from 'express';
import Course from '../models/courseModel.js';
import fs from 'fs';
import path from 'path';
import { HydratedCourseDocument } from '../types/courseTypes.js';

// --- YARDIMCI FONKSİYONLAR ---

const populateOptions = [
    { path: 'instructor', select: 'name email' },
    { path: 'categories', select: 'name' }
];

const checkCourseOwnership = (course: HydratedCourseDocument, req: Request) => {
    if (!course.instructor) {
        throw new Error('Kurs verisi bozuk: Eğitmen bilgisi eksik.');
    }
    if (course.instructor.toString() !== req.user!._id.toString() && req.user!.role !== 'Admin') {
        throw new Error('Bu işlem için yetkiniz yok.');
    }
};

// --- TEMEL KURS CRUD OPERASYONLARI ---

// @desc    Yeni bir kurs oluşturur
export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, categories, price } = req.body;
    console.log("Kurs oluşturma isteği:", { title, description, categories, price });
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Lütfen bir kapak resmi yükleyin.');
        }
        const course = await Course.create({
            title, description, categories, price,
            instructor: req.user!._id,
            coverImage: req.file.path,
            isPublished: false,
        });
        const responseCourse = await Course.findById(course._id).populate(populateOptions);
        res.status(201).json(responseCourse);
    } catch (error) {
        next(error);
    }
};

// @desc    Tüm yayınlanmış kursları listeler
export const getAllPublishedCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate(populateOptions);
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

// @desc    Tek bir kursu ID ile getirir
export const getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await Course.findById(req.params.id).populate(populateOptions);
        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
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
        checkCourseOwnership(course, req);
        Object.assign(course, req.body);
        if (req.file) {
            if (course.coverImage) {
                fs.unlink(path.join(process.cwd(), course.coverImage), err => {
                    if (err) console.error("Eski kurs resmi silinemedi:", err);
                });
            }
            course.coverImage = req.file.path;
        }
        const updatedCourse = await course.save();
        const responseCourse = await Course.findById(updatedCourse._id).populate(populateOptions);
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
        checkCourseOwnership(course, req);
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

// --- YÖNETİM PANELİ İÇİN ÖZEL FONKSİYONLAR ---

// @desc    Bir kursun yayın durumunu değiştirir
export const togglePublishStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }
        checkCourseOwnership(course, req);
        course.isPublished = !course.isPublished;
        const updatedCourse = await course.save();
        res.status(200).json(updatedCourse);
    } catch (error) {
        next(error);
    }
};

// @desc    Giriş yapmış eğitmenin tüm kurslarını getirir
export const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: any = { instructor: req.user!._id };
        if (req.query.status === 'published') filter.isPublished = true;
        if (req.query.status === 'draft') filter.isPublished = false;
        const courses = await Course.find(filter).populate('categories', 'name');
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

// @desc    Admin için tüm kursları getirir
export const getAllCoursesForAdmin = async (req: Request, res: Response, next: NextFunction) => {
     try {
        const filter: any = {};
        if (req.query.status === 'published') filter.isPublished = true;
        if (req.query.status === 'draft') filter.isPublished = false;
        const courses = await Course.find(filter).populate(populateOptions);
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

// --- KURS İÇERİĞİ YÖNETİMİ ---

// @desc    Bir kursa yeni bir bölüm ekler
export const addSectionToCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }
        checkCourseOwnership(course, req);
        course.sections.push({ title: req.body.title } as any);
        await course.save();
        res.status(201).json(course.sections[course.sections.length - 1]);
    } catch (error) {
        next(error);
    }
};

// @desc    Mevcut bir bölümü günceller
export const updateSection = async (req: Request, res: Response, next: NextFunction) => {
    const { title } = req.body;
    const { courseId, sectionId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }
        checkCourseOwnership(course, req);
        const section = course.sections.find(sec => (sec as any)._id.toString() === sectionId);
        if (!section) {
            res.status(404);
            throw new Error('Bölüm bulunamadı.');
        }
        section.title = title;
        await course.save();
        res.status(200).json(section);
    } catch (error) {
        next(error);
    }
};

// @desc    Bir bölümü kurstan siler
export const deleteSection = async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, sectionId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }
        checkCourseOwnership(course, req);
        course.sections = course.sections.filter(sec => (sec as any)._id.toString() !== sectionId);
        await course.save();
        res.status(200).json({ message: 'Bölüm başarıyla silindi.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Bir bölüme yeni bir ders ekler
export const addLectureToSection = async (req: Request, res: Response, next: NextFunction) => {
    const { title, duration, videoUrl, content } = req.body;
    const { courseId, sectionId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }
        checkCourseOwnership(course, req);
        const section = course.sections.find(sec => (sec as any)._id.toString() === sectionId);
        if (!section) {
            res.status(404);
            throw new Error('Bölüm bulunamadı.');
        }
        section.lectures.push({ title, duration, videoUrl, content } as any);
        await course.save();
        res.status(201).json(section.lectures[section.lectures.length - 1]);
    } catch (error) {
        next(error);
    }
};

// @desc    Mevcut bir dersi günceller
export const updateLecture = async (req: Request, res: Response, next: NextFunction) => {
    const { title, duration, videoUrl, content } = req.body;
    const { courseId, sectionId, lectureId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }
        checkCourseOwnership(course, req);
        const section = course.sections.find(sec => (sec as any)._id.toString() === sectionId);
        if (!section) {
            res.status(404);
            throw new Error('Bölüm bulunamadı.');
        }
        const lecture = section.lectures.find(lec => (lec as any)._id.toString() === lectureId);
        if (!lecture) {
            res.status(404);
            throw new Error('Ders bulunamadı.');
        }
        Object.assign(lecture, { title, duration, videoUrl, content });
        await course.save();
        res.status(200).json(lecture);
    } catch (error) {
        next(error);
    }
};

// @desc    Bir dersi bölümden siler
export const deleteLecture = async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, sectionId, lectureId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error('Kurs bulunamadı.');
        }
        checkCourseOwnership(course, req);
        const section = course.sections.find(sec => (sec as any)._id.toString() === sectionId);
        if (!section) {
            res.status(404);
            throw new Error('Bölüm bulunamadı.');
        }
        section.lectures = section.lectures.filter(lec => (lec as any)._id.toString() !== lectureId);
        await course.save();
        res.status(200).json({ message: 'Ders başarıyla silindi.' });
    } catch (error) {
        next(error);
    }
};