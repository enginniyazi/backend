import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import User from '../src/models/userModel.js';
import path from 'path';
import fs from 'fs';
describe('Auth Routes', () => {
    let mongoServer;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });
    afterEach(async () => {
        await User.deleteMany({});
    });
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
    describe('POST /api/auth/register', () => {
        const validUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'Student'
        };
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('_id');
            expect(response.body.user.email).toBe(validUser.email);
            expect(response.body.user).not.toHaveProperty('password');
        });
        it('should not register a user with existing email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send(validUser);
            // Second registration attempt with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });
    });
    describe('POST /api/auth/login', () => {
        const user = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'Student'
        };
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send(user);
        });
        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                email: user.email,
                password: user.password
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('_id');
            expect(response.body.user.email).toBe(user.email);
            expect(response.body.user).not.toHaveProperty('password');
        });
        it('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                email: user.email,
                password: 'wrongpassword'
            });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });
    });
    describe('PUT /api/auth/profile/avatar', () => {
        let token;
        let userId;
        beforeEach(async () => {
            // Önce bir kullanıcı oluştur ve giriş yap
            const user = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'Student'
            };
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(user);
            token = registerResponse.body.token;
            userId = registerResponse.body.user._id;
        });
        it('should update user avatar successfully', async () => {
            // Test için geçici bir dosya oluştur
            const testImagePath = path.join(process.cwd(), 'test-avatar.png');
            fs.writeFileSync(testImagePath, 'fake image content');
            const response = await request(app)
                .put('/api/auth/profile/avatar')
                .set('Authorization', `Bearer ${token}`)
                .attach('avatar', testImagePath);
            // Test dosyasını temizle
            fs.unlinkSync(testImagePath);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('avatar');
            expect(response.body.avatar).toBeTruthy();
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .put('/api/auth/profile/avatar')
                .attach('avatar', Buffer.from('fake image'), 'test.png');
            expect(response.status).toBe(401);
        });
        it('should return 400 if no file is uploaded', async () => {
            const response = await request(app)
                .put('/api/auth/profile/avatar')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });
    });
});
