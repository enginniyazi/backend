// src/controllers/categoryController.ts

import { Request, Response, NextFunction } from 'express';
import Category from '../models/categoryModel.js';
import { ICategory } from '../types/categoryTypes.js';
import Course from '../models/courseModel.js';
// @desc    Yeni bir kategori oluşturur (Sadece Admin)
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;

    try {
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            res.status(400);
            throw new Error('Bu kategori adı zaten mevcut.');
        }

        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

// @desc    Tüm kategorileri listeler (Herkese Açık)
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Tek bir kategoriyi ID ile getirir (Herkese Açık)
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            res.status(404);
            throw new Error('Kategori bulunamadı.');
        }
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

// @desc    Bir kategoriyi günceller (Sadece Admin)
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.params);
    try {
            const category = await Category.findById(req.params.id);
        if (!category) {
            res.status(404);
            throw new Error('Kategori bulunamadı.');
        }

        // Gelen verilerle mevcut verileri güncelle
        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;

        const updatedCategory = await category.save();
        res.status(200).json(updatedCategory);
    } catch (error) {
        next(error);
    }
};

// @desc    Bir kategoriyi siler (Sadece Admin)
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            res.status(404);
            throw new Error('Kategori bulunamadı.');
        }
        
        // Ürün yöneticisi notu: Bir kategoriyi silmeden önce, o kategoriye ait kurs olup olmadığını
        // kontrol etmeliyiz. Eğer varsa, silme işlemini engellemeliyiz.
        const coursesInCategory = await Course.countDocuments({ categories: req.params.id });
        if (coursesInCategory > 0) {
            res.status(400);
            throw new Error('Bu kategoriye ait kurslar varken silemezsiniz. Önce kursları başka bir kategoriye taşıyın.');
        }
        
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Kategori başarıyla silindi.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Tek bir kategoriyi ve o kategoriye ait YAYINLANMIŞ kursları getirir
export const getCategoryWithCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            res.status(404);
            throw new Error('Kategori bulunamadı.');
        }
        const courses = await Course.find({ categories: req.params.id, isPublished: true })
            .populate('instructor', 'name');
        res.status(200).json({ category, courses });
    } catch (error) {
        next(error);
    }
};