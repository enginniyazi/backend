import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../src/server.js';
import User from '../src/models/userModel.js';
import Campaign from '../src/models/campaignModel.js';
import Course from '../src/models/courseModel.js';

describe('Kampanya Rotaları', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let instructorToken: string;
  let adminUser: any;
  let instructorUser: any;
  let testCourse: any;
  let testCampaign: any;
  
  const JWT_SECRET = 'test-secret';

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

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

    // Test kursu oluştur
    testCourse = await Course.create({
      title: 'Test Kursu',
      description: 'Test kurs açıklaması',
      price: 100,
      instructor: instructorUser._id,
      category: new mongoose.Types.ObjectId(),
      coverImage: 'test-cover.png',
      difficulty: 'Beginner',
      duration: '2 saat',
      whatYouWillLearn: ['Test öğrenme hedefi'],
      requirements: ['Test gereksinim'],
    });
  });

  afterEach(async () => {
    await Campaign.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/campaigns', () => {
    const campaignData = {
      title: 'Test Kampanyası',
      description: 'Test kampanya açıklaması',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
      featuredCourses: [] as string[]
    };

    beforeEach(() => {
      campaignData.featuredCourses = [testCourse._id.toString()];
    });

    it('admin yeni bir kampanya oluşturabilmeli', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(campaignData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(campaignData.title);
      expect(response.body.description).toBe(campaignData.description);
      expect(response.body.featuredCourses).toHaveLength(1);
      expect(response.body.featuredCourses[0].toString()).toBe(testCourse._id.toString());
    });

    it('required alanlar eksik olduğunda hata vermeli', async () => {
      const invalidData = {
        title: 'Test Kampanyası'
        // description ve diğer required alanlar eksik
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('çok kısa başlık için hata vermeli', async () => {
      const invalidData = {
        ...campaignData,
        title: 'ab' // 3 karakterden kısa
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('çok kısa açıklama için hata vermeli', async () => {
      const invalidData = {
        ...campaignData,
        description: 'kısa' // 10 karakterden kısa
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('bitiş tarihi başlangıç tarihinden önce olamaz', async () => {
      const invalidData = {
        ...campaignData,
        startDate: new Date('2025-08-10'),
        endDate: new Date('2025-08-09')
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('geçersiz kurs ID\'si ile oluşturulamamalı', async () => {
      const invalidData = {
        ...campaignData,
        featuredCourses: ['64f123456789abcdef123456'] // Var olmayan bir kurs ID'si
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('admin olmayan kullanıcı kampanya oluşturamamalı', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(campaignData);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/campaigns', () => {
    beforeEach(async () => {
      testCampaign = await Campaign.create({
        title: 'Test Kampanyası',
        description: 'Test kampanya açıklaması',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        featuredCourses: [testCourse._id],
        isActive: true
      });
    });

    it('aktif kampanyaları listelemeli', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe(testCampaign.title);
      expect(response.body[0].featuredCourses[0]._id.toString()).toBe(testCourse._id.toString());
    });

    it('inaktif kampanyaları listelememeli', async () => {
      await Campaign.findByIdAndUpdate(testCampaign._id, { isActive: false });

      const response = await request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/campaigns/:id', () => {
    beforeEach(async () => {
      testCampaign = await Campaign.create({
        title: 'Test Kampanyası',
        description: 'Test kampanya açıklaması',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        featuredCourses: [testCourse._id],
        isActive: true
      });
    });

    it('var olan kampanyayı getirebilmeli', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(testCampaign.title);
      expect(response.body.description).toBe(testCampaign.description);
      expect(response.body.featuredCourses[0]._id.toString()).toBe(testCourse._id.toString());
    });

    it('var olmayan kampanya için 404 vermeli', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/campaigns/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('geçersiz ID formatı için hata vermeli', async () => {
      const response = await request(app)
        .get('/api/campaigns/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
    });

    it('admin olmayan kullanıcı kampanyayı görüntüleyememeli', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(403);
    });
  });



  describe('PUT /api/campaigns/:id', () => {
    beforeEach(async () => {
      testCampaign = await Campaign.create({
        title: 'Test Kampanyası',
        description: 'Test kampanya açıklaması',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        featuredCourses: [testCourse._id],
        isActive: true
      });
    });

    it('admin kampanya bilgilerini güncelleyebilmeli', async () => {
      const updateData = {
        title: 'Güncellenmiş Kampanya'
      };

      const response = await request(app)
        .put(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
    });

    it('admin olmayan kullanıcı kampanya güncelleyememeli', async () => {
      const updateData = {
        title: 'Güncellenmiş Kampanya'
      };

      const response = await request(app)
        .put(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
    });

    it('var olmayan kampanyayı güncelleyememeli', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Güncellenmiş Kampanya'
      };

      const response = await request(app)
        .put(`/api/campaigns/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/campaigns/:id', () => {
    beforeEach(async () => {
      testCampaign = await Campaign.create({
        title: 'Test Kampanyası',
        description: 'Test kampanya açıklaması',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        featuredCourses: [testCourse._id],
        isActive: true
      });
    });

    it('admin kampanyayı silebilmeli', async () => {
      const response = await request(app)
        .delete(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      
      // Kampanyanın silindiğini kontrol et
      const deletedCampaign = await Campaign.findById(testCampaign._id);
      expect(deletedCampaign).toBeNull();
    });

    it('admin olmayan kullanıcı kampanyayı silememeli', async () => {
      const response = await request(app)
        .delete(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(403);
      
      // Kampanyanın silinmediğini kontrol et
      const campaign = await Campaign.findById(testCampaign._id);
      expect(campaign).toBeTruthy();
    });

    it('var olmayan kampanyayı silmeye çalışınca 404 vermeli', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/campaigns/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
