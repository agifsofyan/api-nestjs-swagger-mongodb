import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true },
    password: {
        type: String,
        minlength: 6,
        required: true
    },
    avatar: { type: String },
    last_login: { type: Date },
    type: {
        type: String,
        enum: ['User', 'Mentor'],
        default: 'User'
    },
    created_at: { type: Date },
    updated_at: { type: Date }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

UserSchema.pre('save', async function (next: mongoose.HookNextFunction) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        
        const hash = await bcrypt.hash(this['password'], 12);
        this['password'] = hash;
        
        return next();
    } catch (error) {
        return next(error);
    }
});