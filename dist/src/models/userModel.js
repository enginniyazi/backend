// src/models/userModel.ts
import { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['Student', 'Instructor', 'Admin'], default: 'Student' },
    avatar: { type: String },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });
// PRE-SAVE HOOK
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
// METHODS - Artık tiplerle tam uyumlu
UserSchema.methods.comparePassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};
const User = model('User', UserSchema);
export default User;
