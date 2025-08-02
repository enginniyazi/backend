import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../src/server.js';
import User from '../src/models/userModel.js';
import InstructorApplication from '../src/models/instructorApplicationModel.js';

describe('Instructor Routes', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let studentToken: string;
  let adminUser: any;
  let studentUser: any;
  let testApplication: any;
  
  const JWT_SECRET = 'test-secret';

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // JWT_SECRET'ı process.env'e ekle
    process.env.JWT_SECRET = JWT_SECRET;

    // Test kullanıcılarını oluştur
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'Admin'
    });

    studentUser = await User.create({
      name: 'Student User',
      email: 'student@test.com',
      password: 'password123',
      role: 'Student'
    });

    // Tokenları oluştur
    adminToken = jwt.sign(
      { id: adminUser._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    studentToken = jwt.sign(
      { id: studentUser._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  });

  afterEach(async () => {
    await InstructorApplication.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

    describe('POST /api/instructors/apply', () => {
    const applicationData = {
      bio: 'Test Bio',
      expertise: ['Test Expertise']
    };    it('should create application when student', async () => {
      const response = await request(app)
        .post('/api/instructors/apply')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.bio).toBe(applicationData.bio);
      expect(response.body.status).toBe('pending');
      expect(response.body.user.toString()).toBe(studentUser._id.toString());
    });

    it('should not create duplicate application', async () => {
      // İlk başvuruyu yap
      await request(app)
        .post('/api/instructors/apply')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(applicationData);

      // Aynı kullanıcı ile tekrar başvuru yap
      const response = await request(app)
        .post('/api/instructors/apply')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(applicationData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/instructors/applications', () => {
    beforeEach(async () => {
      // Test başvurusu oluştur
      testApplication = await InstructorApplication.create({
        user: studentUser._id,
        bio: 'Test Bio',
        expertise: ['Test Expertise'],
        status: 'pending'
      });
    });

    it('should get all applications when admin', async () => {
      const response = await request(app)
        .get('/api/instructors/applications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].bio).toBe('Test Bio');
    });

    it('should not allow students to view applications', async () => {
      const response = await request(app)
        .get('/api/instructors/applications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/instructors/applications/:id', () => {
    beforeEach(async () => {
      // Reset user role
      await User.findByIdAndUpdate(studentUser._id, { role: 'Student' });

      // Test başvurusu oluştur
      testApplication = await InstructorApplication.create({
        user: studentUser._id,
        bio: 'Test Bio',
        expertise: ['Test Expertise'],
        status: 'pending'
      });
    });

    it('should approve application when admin', async () => {
      const response = await request(app)
        .put(`/api/instructors/applications/${testApplication._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');

      // Kullanıcının rolünün Instructor olarak güncellendiğini kontrol et
      const updatedUser = await User.findById(studentUser._id);
      expect(updatedUser?.role).toBe('Instructor');
    });

    it('should reject application when admin', async () => {
      const response = await request(app)
        .put(`/api/instructors/applications/${testApplication._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('rejected');

      // Kullanıcının rolünün değişmediğini kontrol et
      const updatedUser = await User.findById(studentUser._id);
      expect(updatedUser?.role).toBe('Student');
    });

    it('should not allow students to update applications', async () => {
      const response = await request(app)
        .put(`/api/instructors/applications/${testApplication._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/instructors/my-application', () => {
    beforeEach(async () => {
      // Test başvurusu oluştur
      testApplication = await InstructorApplication.create({
        user: studentUser._id,
        bio: 'Test Bio',
        expertise: ['Test Expertise'],
        status: 'pending'
      });
    });

    it('should get own application', async () => {
      const response = await request(app)
        .get('/api/instructors/my-application')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe('Test Bio');
      expect(response.body.status).toBe('pending');
    });

    it('should return 404 if no application exists', async () => {
      // Önce mevcut başvuruyu sil
      await InstructorApplication.deleteMany({});

      const response = await request(app)
        .get('/api/instructors/my-application')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
    });
  });
});
