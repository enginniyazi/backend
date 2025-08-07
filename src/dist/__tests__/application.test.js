import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../src/server.js';
import User from '../src/models/userModel.js';
import Application from '../src/models/applicationModel.js';
import Lead from '../src/models/leadModel.js';
import Course from '../src/models/courseModel.js';
describe('Başvuru Rotaları', () => {
    let mongoServer;
    let adminToken;
    let testLead;
    let testCourse;
    let adminUser;
    let testApplication;
    const JWT_SECRET = 'test-secret';
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        process.env.JWT_SECRET = JWT_SECRET;
        // Admin kullanıcısı oluştur
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'Admin'
        });
        // Admin token'ı oluştur
        adminToken = jwt.sign({ id: adminUser._id }, JWT_SECRET, { expiresIn: '30d' });
        // Test kursu oluştur
        testCourse = await Course.create({
            title: 'Test Kursu',
            description: 'Test kurs açıklaması',
            price: 100,
            instructor: adminUser._id,
            category: new mongoose.Types.ObjectId(),
            coverImage: 'test-cover.png',
            difficulty: 'Beginner',
            duration: '2 saat',
            whatYouWillLearn: ['Test öğrenme hedefi'],
            requirements: ['Test gereksinim'],
        });
    });
    afterEach(async () => {
        await Application.deleteMany({});
        await Lead.deleteMany({});
    });
    afterAll(async () => {
        await User.deleteMany({});
        await Course.deleteMany({});
        await mongoose.disconnect();
        await mongoServer.stop();
    });
    describe('POST /api/applications', () => {
        const applicationData = {
            name: 'Test Aday',
            email: 'aday@test.com',
            phone: '5551234567',
            courseId: null
        };
        beforeEach(() => {
            applicationData.courseId = testCourse._id.toString();
        });
        it('yeni bir başvuru oluşturmalı ve yeni bir lead oluşturmalı', async () => {
            const response = await request(app)
                .post('/api/applications')
                .send(applicationData);
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.');
            // Lead oluşturulduğunu kontrol et
            const lead = await Lead.findOne({ email: applicationData.email });
            expect(lead).toBeTruthy();
            expect(lead?.name).toBe(applicationData.name);
            expect(lead?.phone).toBe(applicationData.phone);
            // Başvuru oluşturulduğunu kontrol et
            const application = await Application.findOne({ lead: lead?._id }).populate('course');
            expect(application).toBeTruthy();
            expect(application?.course?.id).toBe(testCourse.id);
            expect(application?.status).toBe('Submitted');
        });
        it('var olan lead için yeni başvuru oluşturmalı', async () => {
            // Önce bir lead oluştur
            testLead = await Lead.create({
                name: applicationData.name,
                email: applicationData.email,
                phone: '5559876543', // Eski telefon
                applications: []
            });
            const response = await request(app)
                .post('/api/applications')
                .send(applicationData);
            expect(response.status).toBe(201);
            // Lead'in güncellendiğini kontrol et
            const updatedLead = await Lead.findById(testLead._id);
            expect(updatedLead?.phone).toBe(applicationData.phone); // Yeni telefon
            // Yeni başvurunun lead'e eklendiğini kontrol et
            const application = await Application.findOne({ lead: testLead._id });
            expect(application).toBeTruthy();
            expect(updatedLead?.applications).toContainEqual(application?._id);
        });
    });
    describe('GET /api/applications/all', () => {
        beforeEach(async () => {
            // Test lead'i oluştur
            testLead = await Lead.create({
                name: 'Test Aday',
                email: 'aday@test.com',
                phone: '5551234567'
            });
            // Test başvurusu oluştur
            testApplication = await Application.create({
                lead: testLead._id,
                course: testCourse._id,
                status: 'Submitted'
            });
            // Lead'e başvuruyu ekle
            testLead.applications.push(testApplication._id);
            await testLead.save();
        });
        it('admin tüm başvuruları görüntüleyebilmeli', async () => {
            const response = await request(app)
                .get('/api/applications/all')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(1);
            expect(response.body[0].lead.email).toBe(testLead.email);
            expect(response.body[0].course.title).toBe(testCourse.title);
        });
        it('admin olmayan kullanıcılar başvuruları görüntüleyememeli', async () => {
            // Admin olmayan kullanıcı token'ı oluştur
            const normalUser = await User.create({
                name: 'Normal User',
                email: 'user@test.com',
                password: 'password123',
                role: 'Student'
            });
            const userToken = jwt.sign({ id: normalUser._id }, JWT_SECRET, { expiresIn: '30d' });
            const response = await request(app)
                .get('/api/applications/all')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(403);
        });
    });
    describe('PUT /api/applications/:id/status', () => {
        beforeEach(async () => {
            testLead = await Lead.create({
                name: 'Test Aday',
                email: 'aday@test.com',
                phone: '5551234567'
            });
            testApplication = await Application.create({
                lead: testLead._id,
                course: testCourse._id,
                status: 'Submitted'
            });
        });
        it('admin başvuru durumunu güncelleyebilmeli', async () => {
            const updateData = {
                status: 'Contacted',
                notes: 'Aday ile görüşüldü'
            };
            const response = await request(app)
                .put(`/api/applications/${testApplication._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.status).toBe(updateData.status);
            expect(response.body.notes).toBe(updateData.notes);
            // Durum geçmişinin güncellendiğini kontrol et
            expect(response.body.statusHistory).toHaveLength(2); // İlk durum + güncelleme
            expect(response.body.statusHistory[1].status).toBe(updateData.status);
            expect(response.body.statusHistory[1].changedBy.toString()).toBe(adminUser._id.toString());
        });
        it('geçersiz durum değeri için hata vermeli', async () => {
            const response = await request(app)
                .put(`/api/applications/${testApplication._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'GeçersizDurum' });
            expect(response.status).toBe(400);
        });
    });
});
