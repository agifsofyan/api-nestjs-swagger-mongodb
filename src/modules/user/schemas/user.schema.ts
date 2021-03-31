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
    role: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }],
    is_confirmed: { type: Date, default: null },
    is_forget_pass: { type: Date, default: null },
    otp: {type: String, default: null},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: null }
},{ 
	collection: 'users',
	versionKey: false
});

UserSchema.pre('save', async function (next: mongoose.HookNextFunction) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(this['password'], salt);
        this['password'] = hash;
        
        return next();
    } catch (error) {
        return next(error);
    }
});
