// src/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel.js';
import { HydratedUserDocument } from '../types/userTypes.js';
import { generateToken } from '../config/jwt.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

// Kullanıcı verisini frontend'e göndermeden önce formatlama
// Bu, hassas verileri sızdırmamızı ve tutarlı bir nesne döndürmemizi sağlar.
const formatUserResponse = (user: HydratedUserDocument) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  };
};


// --- Controller Fonksiyonları ---

// @desc    Yeni bir kullanıcı kaydeder
// @route   POST /api/users/register
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  try {
    logger.info('Kullanıcı kaydı başlatıldı', { email }, req);

    const userExists = await User.findOne({ email });

    if (userExists) {
      logger.warn('Kayıt denemesi - e-posta zaten kullanımda', { email }, req);
      res.status(400);
      throw new Error('Bu e-posta adresi zaten kullanımda.');
    }

    const user = await User.create({ name, email, password });

    const userData = formatUserResponse(user);
    const token = generateToken(user._id.toString(), user.role);

    logger.info('Kullanıcı başarıyla kaydedildi', { userId: user._id, email }, req);

    res.status(201).json({
      user: userData,
      token
    });
  } catch (error) {
    logger.error('Kullanıcı kaydı hatası', { error, email }, req);
    next(error);
  }
};

// @desc    Kullanıcının giriş yapmasını sağlar
// @route   POST /api/users/login
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    logger.info('Kullanıcı girişi başlatıldı', { email }, req);

    if (!email || !password) {
      res.status(400);
      throw new Error('Lütfen e-posta ve şifrenizi girin.');
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      const userData = formatUserResponse(user);
      const token = generateToken(user._id.toString(), user.role);

      logger.info('Kullanıcı başarıyla giriş yaptı', { userId: user._id, email }, req);

      res.status(200).json({
        user: userData,
        token
      });
    } else {
      logger.warn('Başarısız giriş denemesi', { email }, req);
      res.status(401);
      throw new Error('Geçersiz e-posta veya şifre.');
    }
  } catch (error) {
    logger.error('Kullanıcı girişi hatası', { error, email }, req);
    next(error);
  }
};

// @desc    Giriş yapmış kullanıcının profil resmini günceller
// @route   PUT /api/users/profile/avatar
export const updateUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id);

    if (!user) {
      res.status(404);
      throw new Error('Kullanıcı bulunamadı.');
    }

    if (!req.file) {
      res.status(400);
      throw new Error('Lütfen bir resim dosyası yükleyin.');
    }

    // --- TODO ÇÖZÜLDÜ: ESKİ AVATARI SİLME MANTIĞI ---

    // 1. Eğer kullanıcının daha önceden bir avatarı varsa...
    if (user.avatar) {
      // 2. O avatarın sunucudaki tam yolunu oluştur.
      // process.cwd() projenin ana dizinini verir (örn: /path/to/YowaAcademy/backend)
      const oldAvatarPath = path.join(process.cwd(), user.avatar);

      // 3. Dosyanın var olup olmadığını kontrol et ve sil.
      // fs.unlink asenkron çalışır ama burada beklememize gerek yok.
      // Hata olursa sadece konsola yazdırırız, ana işlemi engellemez.
      fs.unlink(oldAvatarPath, (err) => {
        if (err) {
          console.error('Eski avatar silinemedi:', oldAvatarPath, err);
        } else {
          console.log('Eski avatar başarıyla silindi:', oldAvatarPath);
        }
      });
    }

    // ------------------------------------------------

    // 4. Yeni avatarın yolunu kaydet.
    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({
      message: 'Profil resmi başarıyla güncellendi.',
      avatar: user.avatar,
    });

  } catch (error) {
    next(error);
  }
};