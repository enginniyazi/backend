// src/types/userTypes.ts

import { Document, Model, Types, HydratedDocument } from 'mongoose';

// 1. Dökümanın temel alanlarını tanımlar (veritabanındaki ham veri)
export interface IUser {
  name: string;
  email: string;
  password: string; // Her zaman sorgulanmadığı için isteğe bağlı
  role: 'Student' | 'Instructor' | 'Admin';
  avatar: string,
  enrolledCourses: Types.ObjectId[];
}

// 2. Döküman metotlarını tanımlar (örn: user.comparePassword())
export interface IUserMethods {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

// 3. Statik Model metotlarını tanımlar (örn: User.findByEmail()) - Şimdilik boş
export interface IUserModel extends Model<IUser, {}, IUserMethods> {}

// Bu, IUser ve IUserMethods'u birleştiren, Mongoose'un döndürdüğü
// tam ve "canlı" dökümanın tipidir. Artık IUserDocument'e ihtiyacımız yok.
export type HydratedUserDocument = HydratedDocument<IUser, IUserMethods>;