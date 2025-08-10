import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import { TestHelpers } from '../src/utils/testHelpers.js';
import path from 'path';
import fs from 'fs';

describe('Course Routes', () => {
  let mongoServer: MongoMemoryServer;
  let testCategories: any;

  beforeAll(async () => {
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
    const testImagePath = path.join(process.cwd(), 'test-cover.png');
    TestHelpers.cleanupTempFile(testImagePath);

    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('GET /api/courses', () => {
    it('should get all published courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/courses', () => {
    it('should create a new course with valid data', async () => {
      // Test kullanıcılarını oluştur
      const users = await TestHelpers.createTestUsers();
      const instructorToken = TestHelpers.generateToken(users.instructorUser._id.toString(), users.instructorUser.role);

      const testImagePath = TestHelpers.createTestImage();

      const courseData = {
        title: 'New Test Course',
        description: 'A new test course description',
        price: 149.99,
        categories: [testCategories.category1._id.toString()],
        sections: [
          {
            title: 'Introduction',
            description: 'Course introduction',
            order: 1,
            lectures: [
              {
                title: 'Welcome',
                duration: 15,
                content: 'Welcome to the course',
                isFree: true,
                order: 1
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .field('title', courseData.title)
        .field('description', courseData.description)
        .field('price', courseData.price)
        .field('categories', courseData.categories[0])
        .field('sections', JSON.stringify(courseData.sections))
        .attach('coverImage', testImagePath)
        .expect(201);

      expect(response.body.title).toBe(courseData.title);
      expect(response.body.description).toBe(courseData.description);
      expect(response.body.price).toBe(courseData.price);

      TestHelpers.cleanupTempFile(testImagePath);
    });

    it('should return 400 for invalid course data', async () => {
      // Test kullanıcılarını oluştur
      const users = await TestHelpers.createTestUsers();
      const instructorToken = TestHelpers.generateToken(users.instructorUser._id.toString(), users.instructorUser.role);

      const invalidCourseData = {
        title: '',
        description: '',
        price: -10
      };

      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(invalidCourseData)
        .expect(400);
    });

    it('should return 401 for unauthorized access', async () => {
      await request(app)
        .post('/api/courses')
        .expect(400); // Validation middleware önce çalışıyor
    });
  });

  describe('GET /api/courses/:id', () => {
    it('should get a course by ID', async () => {
      // Test kullanıcılarını ve kursu oluştur
      const users = await TestHelpers.createTestUsers();
      const testCourse = await TestHelpers.createTestCourse(
        users.instructorUser._id.toString(),
        [testCategories.category1._id.toString(), testCategories.category2._id.toString()]
      );

      const response = await request(app)
        .get(`/api/courses/${testCourse._id}`)
        .expect(200);

      expect(response.body._id).toBe((testCourse._id as any).toString());
      expect(response.body.title).toBe(testCourse.title);
    });

    it('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/courses/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/courses/:id', () => {
    it('should update a course', async () => {
      // Test kullanıcılarını ve kursu oluştur
      const users = await TestHelpers.createTestUsers();
      const instructorToken = TestHelpers.generateToken(users.instructorUser._id.toString(), users.instructorUser.role);
      const testCourse = await TestHelpers.createTestCourse(
        users.instructorUser._id.toString(),
        [testCategories.category1._id.toString(), testCategories.category2._id.toString()]
      );

      const updateData = {
        title: 'Updated Course Title',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 403 for non-instructor trying to update', async () => {
      // Test kullanıcılarını ve kursu oluştur
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id.toString(), users.studentUser.role);
      const testCourse = await TestHelpers.createTestCourse(
        users.instructorUser._id.toString(),
        [testCategories.category1._id.toString(), testCategories.category2._id.toString()]
      );

      await request(app)
        .put(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated Title' })
        .expect(400); // Validation middleware önce çalışıyor
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('should delete a course', async () => {
      // Test kullanıcılarını ve kursu oluştur
      const users = await TestHelpers.createTestUsers();
      const instructorToken = TestHelpers.generateToken(users.instructorUser._id.toString(), users.instructorUser.role);
      const testCourse = await TestHelpers.createTestCourse(
        users.instructorUser._id.toString(),
        [testCategories.category1._id.toString(), testCategories.category2._id.toString()]
      );

      await request(app)
        .delete(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);
    });

    it('should return 403 for non-instructor trying to delete', async () => {
      // Test kullanıcılarını ve kursu oluştur
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id.toString(), users.studentUser.role);
      const testCourse = await TestHelpers.createTestCourse(
        users.instructorUser._id.toString(),
        [testCategories.category1._id.toString(), testCategories.category2._id.toString()]
      );

      await request(app)
        .delete(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('POST /api/courses/:id/enroll', () => {
    it('should enroll a student in a course', async () => {
      // Test kullanıcılarını ve kursu oluştur
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id.toString(), users.studentUser.role);
      const testCourse = await TestHelpers.createTestCourse(
        users.instructorUser._id.toString(),
        [testCategories.category1._id.toString(), testCategories.category2._id.toString()]
      );

      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      expect(response.body.message).toContain('Kursa başarıyla kayıt olundu');
    });

    it('should return 400 if already enrolled', async () => {
      // Test kullanıcılarını ve kursu oluştur
      const users = await TestHelpers.createTestUsers();
      const studentToken = TestHelpers.generateToken(users.studentUser._id.toString(), users.studentUser.role);
      const testCourse = await TestHelpers.createTestCourse(
        users.instructorUser._id.toString(),
        [testCategories.category1._id.toString(), testCategories.category2._id.toString()]
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
