// __tests__/payment.test.ts

import request from 'supertest';
import { app } from '../src/server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { TestHelpers } from '../src/utils/testHelpers.js';

dotenv.config();

let mongoServer: MongoMemoryServer;
let testCategories: any;

describe('Payment and Enrollment Flow', () => {
  beforeAll(async () => {
    // Connect to a test database
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Test environment için JWT secret'ı ayarla
    process.env.JWT_SECRET = TestHelpers.JWT_SECRET;

    // Test kategorilerini oluştur
    testCategories = await TestHelpers.createTestCategories();
  });

  afterEach(async () => {
    await TestHelpers.cleanupTestData();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/payment/create-intent', () => {
    it('should create payment intent successfully', async () => {
      // Test kullanıcılarını oluştur
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id, users.studentUser.role);

      const paymentData = {
        amount: 99.99
      };

      const response = await request(app)
        .post('/api/payment/create-intent')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body).toHaveProperty('paymentForm');
      expect(response.body.paymentForm).toContain('<script');
    });

    it('should return 400 for invalid payment data', async () => {
      // Test kullanıcılarını oluştur
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id, users.studentUser.role);

      const invalidPaymentData = {
        amount: -10
      };

      await request(app)
        .post('/api/payment/create-intent')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidPaymentData)
        .expect(400);
    });
  });

  describe('POST /api/payment/confirm', () => {
    it('should confirm payment successfully', async () => {
      // Test kullanıcılarını oluştur
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id, users.studentUser.role);

      const paymentData = {
        paymentToken: 'pi_test_123456789'
      };

      const response = await request(app)
        .post('/api/payment/confirm')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.message).toContain('Payment confirmed successfully');
    });

    it('should return 400 for invalid payment token', async () => {
      // Test kullanıcılarını oluştur
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id, users.studentUser.role);

      const invalidPaymentData = {
        paymentToken: ''
      };

      await request(app)
        .post('/api/payment/confirm')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidPaymentData)
        .expect(400);
    });
  });

  describe('POST /api/courses/:id/enroll', () => {
    it('should enroll student in course', async () => {
      // Test kullanıcılarını oluştur
      const users = await TestHelpers.createTestUsers();
      const adminUser = users.adminUser;
      const studentUser = users.studentUser;
      const studentToken = TestHelpers.generateToken(studentUser._id, studentUser.role);

      // Test kursu oluştur
      const testCourse = await TestHelpers.createTestCourse(
        adminUser._id,
        [testCategories.category1._id]
      );

      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      expect(response.body.message).toContain('Kursa başarıyla kayıt olundu');
    });

    it('should return 400 if already enrolled', async () => {
      // Test kullanıcılarını oluştur
      const users = await TestHelpers.createTestUsers();
      const adminUser = users.adminUser;
      const studentUser = users.studentUser;
      const studentToken = TestHelpers.generateToken(studentUser._id, studentUser.role);

      // Test kursu oluştur
      const testCourse = await TestHelpers.createTestCourse(
        adminUser._id,
        [testCategories.category1._id]
      );

      // İlk kayıt
      await request(app)
        .post(`/api/courses/${testCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      // İkinci kayıt denemesi
      await request(app)
        .post(`/api/courses/${testCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });
  });
});