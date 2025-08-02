// src/types/express.d.ts

// Kendi User tipimizi import ediyoruz, çünkü 'req.user' bu tipte olacak.
import { HydratedUserDocument } from './userTypes.js';

// TypeScript'in global isim alanını genişletiyoruz.
declare global {
  // Express modülünün içindeki namespace'e ulaşıyoruz.
  namespace Express {
    // Mevcut 'Request' interface'ini bulup, ona yeni bir özellik ekliyoruz.
    export interface Request {
      // Artık 'Request' nesnesinin, 'HydratedUserDocument' tipinde olabilen,
      // isteğe bağlı 'user' adında bir özelliği olduğunu TypeScript biliyor.
      user?: HydratedUserDocument;
    }
  }
}