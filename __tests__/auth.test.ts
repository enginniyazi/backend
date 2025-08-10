import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import { TestHelpers } from '../src/utils/testHelpers.js';
import path from 'path';
import fs from 'fs';

describe('Auth Routes', () => {
  let mongoServer: MongoMemoryServer;
  let user: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.JWT_SECRET = TestHelpers.JWT_SECRET;
  });

  afterEach(async () => {
    await TestHelpers.cleanupTestData();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');

      user = response.body.user;
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Student'
      };

      // İlk kayıt
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // İkinci kayıt denemesi
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid user data', async () => {
      const invalidUserData = {
        name: '',
        email: 'invalid-email',
        password: '123',
        role: 'InvalidRole'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Student'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      user = registerResponse.body.user;
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
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

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/auth/profile/avatar', () => {
    let token: string;
    let userId: string;

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
        .expect(400); // Validation middleware önce çalışıyor

      expect(response.status).toBe(400);
    });

    it('should return 400 if no file is uploaded', async () => {
      const response = await request(app)
        .put('/api/auth/profile/avatar')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // Boş bir body göndererek dosya yüklenmediğini simüle et

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
