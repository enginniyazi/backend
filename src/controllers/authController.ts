// src/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { HydratedUserDocument } from '../types/userTypes.js';
import fs from 'fs';
import path from 'path';

// --- Yardımcı Fonksiyonlar ---

// JWT Oluşturma
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

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
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('Bu e-posta adresi zaten kullanımda.');
    }

    const user = await User.create({ name, email, password });

    const userData = formatUserResponse(user);
    const token = generateToken(user._id.toString());
    res.status(201).json({
      user: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Kullanıcının giriş yapmasını sağlar
// @route   POST /api/users/login
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
        res.status(400);
        throw new Error('Lütfen e-posta ve şifrenizi girin.');
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      const userData = formatUserResponse(user);
      const token = generateToken(user._id.toString());
      res.status(200).json({
        user: userData,
        token
      });
    } else {
      res.status(401);
      throw new Error('Geçersiz e-posta veya şifre.');
    }
  } catch (error) {
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