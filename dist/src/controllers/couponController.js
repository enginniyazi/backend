// src/controllers/couponController.ts
import DiscountCoupon from '../models/discountCouponModel.js';
// @desc    Yeni bir indirim kuponu oluşturur (Admin)
export const createCoupon = async (req, res, next) => {
    try {
        const { code, discountType, discountValue, usageLimit, expiryDate, description } = req.body;
        // Kupon kodu benzersizliğini kontrol et
        const existingCoupon = await DiscountCoupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            res.status(400);
            throw new Error('Bu kupon kodu zaten kullanımda.');
        }
        // Discount değeri kontrolü
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            res.status(400);
            throw new Error('Yüzde indirimi 0-100 arasında olmalıdır.');
        }
        if (discountType === 'fixed' && discountValue <= 0) {
            res.status(400);
            throw new Error("Sabit indirim değeri 0'dan büyük olmalıdır.");
        }
        // Kullanım limiti kontrolü
        if (usageLimit <= 0) {
            res.status(400);
            throw new Error("Kullanım limiti 0'dan büyük olmalıdır.");
        }
        // Son kullanma tarihi kontrolü
        const expiry = new Date(expiryDate);
        if (expiry <= new Date()) {
            res.status(400);
            throw new Error('Son kullanma tarihi gelecekte olmalıdır.');
        }
        const coupon = await DiscountCoupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            usageLimit,
            expiryDate: expiry,
            description
        });
        res.status(201).json(coupon);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Tüm kuponları listeler (Admin)
export const getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await DiscountCoupon.find({});
        res.status(200).json(coupons);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Bir kuponu doğrular (Kullanıcı için)
export const validateCoupon = async (req, res, next) => {
    const { code } = req.params;
    try {
        const coupon = await DiscountCoupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            res.status(404);
            throw new Error('Kupon kodu bulunamadı.');
        }
        // Kuponun aktif olup olmadığını kontrol et
        if (!coupon.isActive) {
            res.status(400);
            throw new Error('Bu kupon aktif değil.');
        }
        // Son kullanma tarihini kontrol et
        if (coupon.expiryDate < new Date()) {
            res.status(400);
            throw new Error('Bu kuponun süresi dolmuş.');
        }
        // Kullanım limitini kontrol et
        if (coupon.timesUsed >= coupon.usageLimit) {
            res.status(400);
            throw new Error('Bu kupon kullanım limitine ulaşmış.');
        }
        res.status(200).json({
            isValid: true,
            discount: coupon.discountValue,
            discountType: coupon.discountType,
            code: coupon.code
        });
    }
    catch (error) {
        next(error);
    }
};
// @desc    Bir kuponu günceller (Admin)
export const updateCoupon = async (req, res, next) => {
    const { id } = req.params;
    const { isActive, discountType, discountValue, usageLimit, expiryDate, description } = req.body;
    try {
        const coupon = await DiscountCoupon.findById(id);
        if (!coupon) {
            res.status(404);
            throw new Error("Kupon bulunamadı.");
        }
        // Discount değeri güncellemesi varsa kontrol et
        if (discountValue !== undefined) {
            if ((discountType || coupon.discountType) === "percentage" && (discountValue <= 0 || discountValue > 100)) {
                res.status(400);
                throw new Error("Yüzde indirimi 0-100 arasında olmalıdır.");
            }
            if ((discountType || coupon.discountType) === "fixed" && discountValue <= 0) {
                res.status(400);
                throw new Error("Sabit indirim değeri 0'dan büyük olmalıdır.");
            }
        }
        // Kullanım limiti güncellemesi varsa kontrol et
        if (usageLimit !== undefined && usageLimit <= 0) {
            res.status(400);
            throw new Error("Kullanım limiti 0'dan büyük olmalıdır.");
        }
        // Son kullanma tarihi güncellemesi varsa kontrol et
        if (expiryDate) {
            const newExpiryDate = new Date(expiryDate);
            if (newExpiryDate <= new Date()) {
                res.status(400);
                throw new Error("Son kullanma tarihi gelecekte olmalıdır.");
            }
        }
        // Mevcut kullanım sayısı yeni limitten büyükse güncellemeye izin verme
        if (usageLimit !== undefined && coupon.timesUsed > usageLimit) {
            res.status(400);
            throw new Error("Yeni kullanım limiti, mevcut kullanım sayısından küçük olamaz.");
        }
        // Güncelleme
        if (req.body.code) {
            // Yeni kod ile başka kupon var mı kontrol et
            const existingCoupon = await DiscountCoupon.findOne({
                code: req.body.code.toUpperCase(),
                _id: { $ne: id } // Kendisi hariç
            });
            if (existingCoupon) {
                res.status(400);
                throw new Error("Bu kupon kodu zaten kullanımda.");
            }
            coupon.code = req.body.code.toUpperCase();
        }
        coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
        coupon.discountType = discountType || coupon.discountType;
        coupon.discountValue = discountValue !== undefined ? discountValue : coupon.discountValue;
        coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
        coupon.expiryDate = expiryDate ? new Date(expiryDate) : coupon.expiryDate;
        coupon.description = description !== undefined ? description : coupon.description;
        const updatedCoupon = await coupon.save();
        res.status(200).json(updatedCoupon);
    }
    catch (error) {
        next(error);
    }
};
// @desc    Bir kuponu siler (Admin)
export const deleteCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coupon = await DiscountCoupon.findById(id);
        if (!coupon) {
            res.status(404);
            throw new Error("Kupon bulunamadı.");
        }
        // Aktif ve kullanımda olan bir kuponu silmeye çalışıyorsa uyar
        if (coupon.isActive && coupon.timesUsed > 0) {
            res.status(400);
            throw new Error("Aktif ve kullanılmış bir kuponu silemezsiniz. Önce deaktif edin.");
        }
        await DiscountCoupon.findByIdAndDelete(id);
        res.status(200).json({ message: "Kupon başarıyla silindi." });
    }
    catch (error) {
        next(error);
    }
};
