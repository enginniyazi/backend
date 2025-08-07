import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../src/server.js';
import User from '../src/models/userModel.js';
import Category from '../src/models/categoryModel.js';
describe('Category Routes', () => {
    let mongoServer;
    let adminToken;
    let userToken;
    let testCategory;
    const JWT_SECRET = 'test-secret';
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        // JWT_SECRET'ı process.env'e ekle
        process.env.JWT_SECRET = JWT_SECRET;
        // Admin kullanıcısı oluştur
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'Admin'
        });
        // Normal kullanıcı oluştur
        const normalUser = await User.create({
            name: 'Normal User',
            email: 'user@test.com',
            password: 'password123',
            role: 'Student'
        });
        // Tokenları oluştur
        adminToken = jwt.sign({ id: adminUser._id }, JWT_SECRET, { expiresIn: '30d' });
        userToken = jwt.sign({ id: normalUser._id }, JWT_SECRET, { expiresIn: '30d' });
    });
    afterEach(async () => {
        await Category.deleteMany({});
    });
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
    describe('POST /api/categories', () => {
        const newCategory = {
            name: 'Test Category',
            description: 'Test Description'
        };
        it('should create a new category when admin', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newCategory);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.name).toBe(newCategory.name);
            expect(response.body.description).toBe(newCategory.description);
        });
        it('should not create category when user is not admin', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newCategory);
            expect(response.status).toBe(403);
        });
        it('should not create category without authentication', async () => {
            const response = await request(app)
                .post('/api/categories')
                .send(newCategory);
            expect(response.status).toBe(401);
        });
    });
    describe('GET /api/categories', () => {
        beforeEach(async () => {
            // Test kategorisi oluştur
            testCategory = await Category.create({
                name: 'Test Category',
                description: 'Test Description'
            });
        });
        it('should get all categories', async () => {
            const response = await request(app)
                .get('/api/categories');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(1);
            expect(response.body[0].name).toBe(testCategory.name);
        });
    });
    describe('GET /api/categories/:id', () => {
        beforeEach(async () => {
            testCategory = await Category.create({
                name: 'Test Category',
                description: 'Test Description'
            });
        });
        it('should get category by id', async () => {
            const response = await request(app)
                .get(`/api/categories/${testCategory._id}`);
            expect(response.status).toBe(200);
            expect(response.body._id.toString()).toBe(testCategory._id.toString());
            expect(response.body.name).toBe(testCategory.name);
        });
        it('should return 404 for non-existent category', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/categories/${fakeId}`);
            expect(response.status).toBe(404);
        });
    });
    describe('PUT /api/categories/:id', () => {
        beforeEach(async () => {
            testCategory = await Category.create({
                name: 'Test Category',
                description: 'Test Description'
            });
        });
        it('should update category when admin', async () => {
            const updateData = {
                name: 'Updated Category',
                description: 'Updated Description'
            };
            const response = await request(app)
                .put(`/api/categories/${testCategory._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.name).toBe(updateData.name);
            expect(response.body.description).toBe(updateData.description);
        });
        it('should not update category when user is not admin', async () => {
            const response = await request(app)
                .put(`/api/categories/${testCategory._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Try Update' });
            expect(response.status).toBe(403);
        });
    });
    describe('DELETE /api/categories/:id', () => {
        beforeEach(async () => {
            testCategory = await Category.create({
                name: 'Test Category',
                description: 'Test Description'
            });
        });
        it('should delete category when admin', async () => {
            const response = await request(app)
                .delete(`/api/categories/${testCategory._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            // Kategorinin gerçekten silindiğini kontrol et
            const categoryExists = await Category.findById(testCategory._id);
            expect(categoryExists).toBeNull();
        });
        it('should not delete category when user is not admin', async () => {
            const response = await request(app)
                .delete(`/api/categories/${testCategory._id}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(403);
            // Kategorinin silinmediğini kontrol et
            const categoryExists = await Category.findById(testCategory._id);
            expect(categoryExists).toBeTruthy();
        });
    });
});
