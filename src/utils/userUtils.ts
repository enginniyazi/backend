// src/utils/userUtils.ts
import { HydratedUserDocument } from '../types/userTypes.js';

// Kullanıcı nesnesini alıp, hassas verileri temizleyen ve avatar URL'ini ekleyen bir fonksiyon.
export const formatUserResponse = (user: HydratedUserDocument) => {
    // Tam avatar URL'ini oluştur. (req nesnesi olmadığı için process.env'den okumak daha zordur.
    // Şimdilik sadece yolu döndürelim, frontend bunu birleştirecek.)
    
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar, // Şimdilik sadece yolu döndür
        role: user.role,
    };
};