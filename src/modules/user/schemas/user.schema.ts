import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true },
    phone_number: { type: String },
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
        
        const hash = await bcrypt.hash(this['password'], 12);
        this['password'] = hash;
        
        return next();
    } catch (error) {
        return next(error);
    }
});
