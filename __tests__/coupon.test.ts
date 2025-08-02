import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../src/server.js';
import User from '../src/models/userModel.js';
import DiscountCoupon from '../src/models/discountCouponModel.js';

describe('Kupon Rotaları', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;
  let testCoupon: any;
  
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

    regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'password123',
      role: 'Student'
    });

    // Tokenları oluştur
    adminToken = jwt.sign(
      { id: adminUser._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    userToken = jwt.sign(
      { id: regularUser._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  });

  afterEach(async () => {
    await DiscountCoupon.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/coupons', () => {
    const couponData = {
      code: 'TEST100',
      discountType: 'percentage',
      discountValue: 10,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
      usageLimit: 100
    };

    it('admin yeni bir kupon oluşturabilmeli', async () => {
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(couponData);

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(couponData.code);
      expect(response.body.discountType).toBe(couponData.discountType);
      expect(response.body.discountValue).toBe(couponData.discountValue);
    });

    it('admin olmayan kullanıcı kupon oluşturamamalı', async () => {
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${userToken}`)
        .send(couponData);

      expect(response.status).toBe(403);
    });

    it('aynı kodla iki kupon oluşturulamamalı', async () => {
      // İlk kuponu oluştur
      await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(couponData);

      // Aynı kodla ikinci bir kupon oluşturmayı dene
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(couponData);

      expect(response.status).toBe(400);
    });

    it('geçersiz indirim tipi için hata vermeli', async () => {
      const invalidData = {
        ...couponData,
        discountType: 'invalid'
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('geçersiz indirim değeri için hata vermeli', async () => {
      const invalidData = {
        ...couponData,
        discountValue: -10
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('geçmiş tarihli son kullanma tarihi için hata vermeli', async () => {
      const invalidData = {
        ...couponData,
        expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 gün önce
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/coupons/validate/:code', () => {
    beforeEach(async () => {
      testCoupon = await DiscountCoupon.create({
        code: 'TEST100',
        discountType: 'percentage',
        discountValue: 10,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: true
      });
    });

    it('geçerli kupon kodu doğrulanabilmeli', async () => {
      const response = await request(app)
        .get('/api/coupons/validate/TEST100');

      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(true);
      expect(response.body.discount).toBe(10);
      expect(response.body.discountType).toBe('percentage');
    });

    it('geçersiz kupon kodu için hata vermeli', async () => {
      const response = await request(app)
        .get('/api/coupons/validate/INVALID');

      expect(response.status).toBe(404);
    });

    it('süresi geçmiş kupon için hata vermeli', async () => {
      // Kuponun süresini geçmiş olarak güncelle
      await DiscountCoupon.findByIdAndUpdate(testCoupon._id, {
        expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 gün önce
      });

      const response = await request(app)
        .get('/api/coupons/validate/TEST100');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('süresi');
    });

    it('kullanım limiti dolmuş kupon için hata vermeli', async () => {
      // Kuponun kullanım limitini doldur
      await DiscountCoupon.findByIdAndUpdate(testCoupon._id, {
        usageLimit: 1,
        timesUsed: 1
      });

      const response = await request(app)
        .get('/api/coupons/validate/TEST100');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('limit');
    });

    it('inaktif kupon için hata vermeli', async () => {
      await DiscountCoupon.findByIdAndUpdate(testCoupon._id, {
        isActive: false
      });

      const response = await request(app)
        .get('/api/coupons/validate/TEST100');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('aktif');
    });
  });

  describe('GET /api/coupons', () => {
    beforeEach(async () => {
      testCoupon = await DiscountCoupon.create({
        code: 'TEST100',
        discountType: 'percentage',
        discountValue: 10,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: true
      });
    });

    it('admin tüm kuponları listeleyebilmeli', async () => {
      const response = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].code).toBe(testCoupon.code);
    });

    it('admin olmayan kullanıcı kuponları listeleyememeli', async () => {
      const response = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/coupons/:id', () => {
    beforeEach(async () => {
      testCoupon = await DiscountCoupon.create({
        code: 'TEST100',
        discountType: 'percentage',
        discountValue: 10,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: true
      });
    });

    it('admin kupon bilgilerini güncelleyebilmeli', async () => {
      const updateData = {
        code: 'UPDATED100',
        discountValue: 20
      };

      const response = await request(app)
        .put(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(updateData.code);
      expect(response.body.discountValue).toBe(updateData.discountValue);
    });

    it('admin olmayan kullanıcı kupon güncelleyememeli', async () => {
      const updateData = {
        discountValue: 20
      };

      const response = await request(app)
        .put(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
    });

    it('var olmayan kupon için 404 vermeli', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        discountValue: 20
      };

      const response = await request(app)
        .put(`/api/coupons/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/coupons/:id', () => {
    beforeEach(async () => {
      testCoupon = await DiscountCoupon.create({
        code: 'TEST100',
        discountType: 'percentage',
        discountValue: 10,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: true
      });
    });

    it('admin kuponu silebilmeli', async () => {
      const response = await request(app)
        .delete(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Kuponun silindiğini kontrol et
      const deletedCoupon = await DiscountCoupon.findById(testCoupon._id);
      expect(deletedCoupon).toBeNull();
    });

    it('admin olmayan kullanıcı kuponu silememeli', async () => {
      const response = await request(app)
        .delete(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);

      // Kuponun silinmediğini kontrol et
      const coupon = await DiscountCoupon.findById(testCoupon._id);
      expect(coupon).toBeTruthy();
    });

    it('var olmayan kupon için 404 vermeli', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/coupons/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
