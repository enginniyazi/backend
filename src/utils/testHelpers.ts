// src/utils/testHelpers.ts

import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Category from '../models/categoryModel.js';
import { HydratedUserDocument } from '../types/userTypes.js';
import fs from 'fs';
import path from 'path';

export class TestHelpers {
    static JWT_SECRET = 'test-secret-key';

    // Test kullanıcıları oluştur
    static async createTestUsers() {
        const adminUser = await User.create({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'Admin'
        });

        const instructorUser = await User.create({
            name: 'Test Instructor',
            email: 'instructor@test.com',
            password: 'password123',
            role: 'Instructor'
        });

        const studentUser = await User.create({
            name: 'Test Student',
            email: 'student@test.com',
            password: 'password123',
            role: 'Student'
        });

        return { adminUser, instructorUser, studentUser };
    }

    // Test kategorileri oluştur
    static async createTestCategories() {
        const category1 = await Category.create({
            name: 'Test Category 1',
            description: 'Test category description 1'
        });

        const category2 = await Category.create({
            name: 'Test Category 2',
            description: 'Test category description 2'
        });

        return { category1, category2 };
    }

    // JWT token oluştur
    static generateToken(userId: string, role: string): string {
        return jwt.sign(
            { id: userId, role },
            this.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }

    // Test verilerini temizle (tüm verileri)
    static async cleanupTestData() {
        await User.deleteMany({});
        await Course.deleteMany({});
        await Category.deleteMany({});
    }

    // Test kursu oluştur
    static async createTestCourse(instructorId: string, categoryIds: string[]) {
        return await Course.create({
            title: 'Test Course',
            description: 'Test course description',
            instructor: instructorId,
            categories: categoryIds,
            price: 99.99,
            coverImage: 'test-cover.jpg',
            sections: [
                {
                    title: 'Test Section 1',
                    description: 'Test section description',
                    order: 1,
                    lectures: [
                        {
                            title: 'Test Lecture 1',
                            duration: 30,
                            content: 'Test lecture content',
                            isFree: true,
                            order: 1
                        }
                    ]
                }
            ]
        });
    }

    // Test resmi oluştur
    static createTestImage(): string {
        const testImagePath = path.join(process.cwd(), 'test-cover.png');
        const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        fs.writeFileSync(testImagePath, Buffer.from(base64Image, 'base64'));

        return testImagePath;
    }

    // Test dosyasını temizle
    static cleanupTempFile(filePath: string) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
} 