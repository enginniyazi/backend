import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../src/server.js';
import User from '../src/models/userModel.js';
import Course from '../src/models/courseModel.js';
import path from 'path';
import fs from 'fs';

describe('Course Routes', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;
  let adminUser: any;
  let instructorUser: any;
  let studentUser: any;
  let testCourse: any;
  
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

    instructorUser = await User.create({
      name: 'Instructor User',
      email: 'instructor@test.com',
      password: 'password123',
      role: 'Instructor'
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

    instructorToken = jwt.sign(
      { id: instructorUser._id },
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
    // Test dosyalarını temizle
    const testImagePath = path.join(process.cwd(), 'test-cover.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    await Course.deleteMany({});
  });

  afterAll(async () => {
    // Test dosyasını temizle
    const testImagePath = path.join(process.cwd(), 'test-cover.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    await User.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('GET /api/courses', () => {
    beforeEach(async () => {
      // Test için geçici bir resim dosyası oluştur
      const testImagePath = path.join(process.cwd(), 'test-cover.png');
      fs.writeFileSync(testImagePath, 'fake image content');

      // Yayınlanmış ve yayınlanmamış kurslar oluştur
      await Course.create([
        {
          title: 'Published Course',
          description: 'Test Description',
          instructor: instructorUser._id,
          price: 29.99,
          isPublished: true,
          coverImage: testImagePath
        },
        {
          title: 'Unpublished Course',
          description: 'Test Description',
          instructor: instructorUser._id,
          price: 29.99,
          isPublished: false,
          coverImage: testImagePath
        }
      ]);
    });

    it('should get all published courses', async () => {
      const response = await request(app)
        .get('/api/courses');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Published Course');
    });
  });

  describe('GET /api/courses/my-courses', () => {
    beforeEach(async () => {
      // Test için geçici bir resim dosyası oluştur
      const testImagePath = path.join(process.cwd(), 'test-cover.png');
      fs.writeFileSync(testImagePath, 'fake image content');

      // İki farklı eğitmene ait kurslar oluştur
      await Course.create([
        {
          title: 'Instructor Course 1',
          description: 'Test Description',
          instructor: instructorUser._id,
          price: 29.99,
          coverImage: testImagePath
        },
        {
          title: 'Other Instructor Course',
          description: 'Test Description',
          instructor: adminUser._id,
          price: 29.99,
          coverImage: testImagePath
        }
      ]);
    });

    it('should get instructor\'s own courses', async () => {
      const response = await request(app)
        .get('/api/courses/my-courses')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Instructor Course 1');
    });

    it('should not allow students to access my-courses', async () => {
      const response = await request(app)
        .get('/api/courses/my-courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/courses', () => {
    const courseData = {
      title: 'New Course',
      description: 'Course Description',
      price: 29.99,
      category: new mongoose.Types.ObjectId()
    };

    beforeEach(() => {
      // Test için geçici bir resim dosyası oluştur
      const testImagePath = path.join(process.cwd(), 'test-cover.png');
      fs.writeFileSync(testImagePath, 'fake image content');
    });

    it('should create course when instructor', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .field('title', courseData.title)
        .field('description', courseData.description)
        .field('price', courseData.price)
        .field('category', courseData.category.toString())
        .attach('coverImage', path.join(process.cwd(), 'test-cover.png'));

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(courseData.title);
      expect(response.body.instructor._id).toBe(instructorUser._id.toString());
    });

    it('should not create course when student', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('title', courseData.title)
        .field('description', courseData.description)
        .field('price', courseData.price)
        .field('category', courseData.category.toString())
        .attach('coverImage', path.join(process.cwd(), 'test-cover.png'));

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/courses/:id', () => {
    beforeEach(async () => {
      // Test için geçici bir resim dosyası oluştur
      const testImagePath = path.join(process.cwd(), 'test-cover.png');
      fs.writeFileSync(testImagePath, 'fake image content');

      testCourse = await Course.create({
        title: 'Test Course',
        description: 'Test Description',
        instructor: instructorUser._id,
        price: 29.99,
        category: new mongoose.Types.ObjectId(),
        coverImage: testImagePath
      });
    });

    it('should update own course when instructor', async () => {
      const updateData = {
        title: 'Updated Course',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
    });

    it('should not update other\'s course when instructor', async () => {
      // Başka bir eğitmen oluştur ve onun token'ını al
      const otherInstructor = await User.create({
        name: 'Other Instructor',
        email: 'other.instructor@test.com',
        password: 'password123',
        role: 'Instructor'
      });

      const otherInstructorToken = jwt.sign(
        { id: otherInstructor._id },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      const response = await request(app)
        .put(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${otherInstructorToken}`)
        .send({ title: 'Try Update' });

      expect(response.status).toBe(403);
    });

    it('should update any course when admin', async () => {
      const updateData = {
        title: 'Admin Updated Course',
        description: 'Admin Updated Description'
      };

      const response = await request(app)
        .put(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
    });
  });

  describe('PUT /api/courses/:id/toggle-publish', () => {
    beforeEach(async () => {
      // Test için geçici bir resim dosyası oluştur
      const testImagePath = path.join(process.cwd(), 'test-cover.png');
      fs.writeFileSync(testImagePath, 'fake image content');

      testCourse = await Course.create({
        title: 'Test Course',
        description: 'Test Description',
        instructor: instructorUser._id,
        price: 29.99,
        isPublished: false,
        coverImage: testImagePath
      });
    });

    it('should toggle publish status when instructor owns the course', async () => {
      const response = await request(app)
        .put(`/api/courses/${testCourse._id}/toggle-publish`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isPublished).toBe(true);
    });

    it('should toggle publish status when admin', async () => {
      const response = await request(app)
        .put(`/api/courses/${testCourse._id}/toggle-publish`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isPublished).toBe(true);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    beforeEach(async () => {
      // Test için geçici bir resim dosyası oluştur
      const testImagePath = path.join(process.cwd(), 'test-cover.png');
      fs.writeFileSync(testImagePath, 'fake image content');

      testCourse = await Course.create({
        title: 'Test Course',
        description: 'Test Description',
        instructor: instructorUser._id,
        price: 29.99,
        coverImage: testImagePath
      });
    });

    it('should delete own course when instructor', async () => {
      const response = await request(app)
        .delete(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(200);
      
      const courseExists = await Course.findById(testCourse._id);
      expect(courseExists).toBeNull();
    });

    it('should not delete other\'s course when instructor', async () => {
      const otherInstructor = await User.create({
        name: 'Other Instructor',
        email: 'other.delete@test.com',
        password: 'password123',
        role: 'Instructor'
      });

      const otherInstructorToken = jwt.sign(
        { id: otherInstructor._id },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      const response = await request(app)
        .delete(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${otherInstructorToken}`);

      expect(response.status).toBe(403);
      
      const courseExists = await Course.findById(testCourse._id);
      expect(courseExists).toBeTruthy();
    });

    it('should delete any course when admin', async () => {
      const response = await request(app)
        .delete(`/api/courses/${testCourse._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      
      const courseExists = await Course.findById(testCourse._id);
      expect(courseExists).toBeNull();
    });
  });
});
