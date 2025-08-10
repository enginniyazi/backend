// src/models/discountCouponModel.ts
import { model, Schema } from 'mongoose';
const DiscountCouponSchema = new Schema({
    description: {
        type: String,
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Kupon kodu zorunludur'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [4, 'Kupon kodu en az 4 karakter olmalıdır']
    },
    discountType: {
        type: String,
        enum: {
            values: ['percentage', 'fixed'],
            message: 'İndirim tipi percentage veya fixed olmalıdır'
        },
        required: [true, 'İndirim tipi zorunludur']
    },
    discountValue: {
        type: Number,
        required: [true, 'İndirim değeri zorunludur'],
        min: [0, 'İndirim değeri 0\'dan küçük olamaz'],
        validate: {
            validator: function (value) {
                if (this.discountType === 'percentage') {
                    return value <= 100;
                }
                return true;
            },
            message: 'Yüzde indirimi 100\'den büyük olamaz'
        }
    },
    expiryDate: {
        type: Date,
        required: [true, 'Son kullanma tarihi zorunludur'],
        validate: {
            validator: function (value) {
                return value > new Date();
            },
            message: 'Son kullanma tarihi gelecekte olmalıdır'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: 100,
        min: [1, 'Kullanım limiti en az 1 olmalıdır']
    },
    timesUsed: {
        type: Number,
        default: 0,
        min: 0
    },
}, { timestamps: true });
const DiscountCoupon = model('DiscountCoupon', DiscountCouponSchema);
export default DiscountCoupon;
