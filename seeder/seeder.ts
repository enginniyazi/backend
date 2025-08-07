// seeder/seeder.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- TÜM MODELLERİ IMPORT ET ---
import User from '../src/models/userModel.js';
import Category from '../src/models/categoryModel.js';
import Course from '../src/models/courseModel.js';
import InstructorProfile from '../src/models/instructorProfileModel.js';
import Lead from '../src/models/leadModel.js';
import Application from '../src/models/applicationModel.js';
import Campaign from '../src/models/campaignModel.js';
import DiscountCoupon from '../src/models/discountCouponModel.js';
import InstructorApplication from '../src/models/instructorApplicationModel.js';

// --- YAPILANDIRMA ---
dotenv.config({ path: './.env' });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- VERİTABANI BAĞLANTISI ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('MongoDB Bağlantısı Başarılı (Seeder)');
    } catch (error: any) {
        console.error(`Hata: ${error.message}`);
        process.exit(1);
    }
};

// --- VERİLERİ SİLME ---
const destroyData = async () => {
    try {
        await Promise.all([
            User.deleteMany(), Category.deleteMany(), Course.deleteMany(),
            InstructorProfile.deleteMany(), Lead.deleteMany(), Application.deleteMany(),
            Campaign.deleteMany(), DiscountCoupon.deleteMany(), InstructorApplication.deleteMany()
        ]);
        console.log('TÜM VERİLER SİLİNDİ!');
        process.exit();
    } catch (error: any) {
        console.error(`Hata: ${error.message}`);
        process.exit(1);
    }
};

// --- VERİLERİ İÇE AKTARMA ---
const importData = async () => {
    try {
        // 1. Önce tüm mevcut verileri SİL
        await Promise.all([
            User.deleteMany(), Category.deleteMany(), Course.deleteMany(),
            InstructorProfile.deleteMany(), Lead.deleteMany(), Application.deleteMany(),
            Campaign.deleteMany(), DiscountCoupon.deleteMany(), InstructorApplication.deleteMany()
        ]);
        console.log('Mevcut veriler temizlendi.');

        // 2. JSON dosyalarından ham verileri oku
        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf-8'));
        const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'categories.json'), 'utf-8'));
        const leadsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'leads.json'), 'utf-8'));
        const campaignsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'campaigns.json'), 'utf-8'));
        const couponsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'coupons.json'), 'utf-8'));
        const coursesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'courses.json'), 'utf-8'));

        // 3. Kullanıcıları, .create() ile TEK TEK oluşturarak 'pre-save' hook'unu (şifre hash'leme) tetikle
        const createdUsers = await Promise.all(
            usersData.map((user: any) => User.create(user))
        );
        console.log('Kullanıcılar şifreleri hashlenerek oluşturuldu.');

        // Diğer verileri toplu halde oluşturabiliriz
        const createdCategories = await Category.insertMany(categoriesData);
        await Lead.insertMany(leadsData);
        await DiscountCoupon.insertMany(couponsData);
        console.log('Temel veriler (Category, Lead, Coupon) oluşturuldu.');

        // 4. İlişkili verileri dinamik olarak oluştur
        const instructor1 = createdUsers.find(u => u.email === 'instructor@yowa.com')!;
        const student1 = createdUsers.find(u => u.email === 'student@yowa.com')!;
        const webDevCategory = createdCategories.find(c => c.name === 'Web Geliştirme')!;
        const mobileDevCategory = createdCategories.find(c => c.name === 'Mobil Geliştirme')!;
        const dataScienceCategory = createdCategories.find(c=>c.name==='Veri Bilimi')!;
        const categoryArray = [webDevCategory,mobileDevCategory,dataScienceCategory];

        await InstructorProfile.create({
            user: instructor1._id,
            bio: "10+ yıllık tecrübe ile full-stack web geliştirme uzmanı.",
            expertise: ["React", "Node.js", "GraphQL"]
        });
        console.log('Eğitmen Profilleri oluşturuldu.');

        coursesData.map((user: any) => { user.instructor = instructor1._id; user.categories = categoryArray[Math.floor(Math.random() * (2 - 0 + 1) + 0)] });
        const createdCourses = await Course.insertMany(coursesData);
        console.log('Örnek Kurslar oluşturuldu.');

        const campaignsToCreate = campaignsData.map((campaign: any, index: number) => ({
            title: campaign.title,
            description: campaign.description,
            startDate: new Date(campaign.startDate),
            endDate: new Date(campaign.endDate),
            isActive: campaign.isActive,
            featuredCourses: [createdCourses[index % createdCourses.length]._id]
        }));
        await Campaign.insertMany(campaignsToCreate);
        console.log('Kampanyalar, kurslarla ilişkilendirilerek oluşturuldu.');

        await User.findByIdAndUpdate(student1._id, { $push: { enrolledCourses: createdCourses[0]._id } });
        console.log('Öğrenci kursa kaydedildi.');

        const lead1 = await Lead.findOne({ email: 'ahmet.celik@email.com' });
        await Application.create({ lead: lead1!._id, course: createdCourses[1]._id });
        console.log('Örnek Başvurular oluşturuldu.');

        console.log('\nVERİ İÇE AKTARMA TAMAMLANDI!');
        process.exit(0);
    } catch (error: any) {
        console.error(`HATA: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
};

// --- SCRIPT'İ ÇALIŞTIRMA MANTIĞI ---
(async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
})();