// __tests__/payment.test.ts

import request from 'supertest';
import { app } from '../src/server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { TestHelpers } from '../src/utils/testHelpers.js';
import User from '../src/models/userModel.js';
import Course from '../src/models/courseModel.js';
import Enrollment from '../src/models/enrollmentModel.js';
import path from 'path'; // Added for path.join

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

  describe('POST /api/payment/create-payment-form', () => {
    it('should create payment form successfully', async () => {
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id.toString(), users.studentUser.role);

      const paymentData = {
        amount: 99.99,
        courseId: '507f1f77bcf86cd799439011'
      };

      const res = await request(app)
        .post(`/api/payment/create-payment-form`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(paymentData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('paymentForm');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('conversationId');
      expect(typeof res.body.paymentForm).toBe('string');
    });

    it('should return 400 for invalid payment data', async () => {
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id.toString(), users.studentUser.role);

      const invalidPaymentData = {
        amount: -10
      };

      const res = await request(app)
        .post(`/api/payment/create-payment-form`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidPaymentData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Amount must be a positive number');
    });
  });

  describe('POST /api/payment/confirm-payment', () => {
    it('should confirm payment successfully', async () => {
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id.toString(), users.studentUser.role);
      const adminUser = users.adminUser;
      const testCourse = await TestHelpers.createTestCourse(
        adminUser._id.toString(),
        [testCategories.category1._id.toString()]
      );

      const res = await request(app)
        .post(`/api/payment/confirm-payment`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          token: 'mock_payment_token_123',
          courseId: testCourse._id.toString()
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Payment confirmed and enrollment successful');
      expect(res.body).toHaveProperty('enrollment');

      const enrollment = await Enrollment.findOne({ user: users.studentUser._id, course: testCourse._id });
      expect(enrollment).toBeDefined();
      expect(enrollment?.paymentStatus).toEqual('completed');
    });

    it('should return 400 for invalid payment token', async () => {
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id.toString(), users.studentUser.role);

      const invalidPaymentData = {
        token: ''
      };

      const res = await request(app)
        .post(`/api/payment/confirm-payment`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidPaymentData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Payment token is required');
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