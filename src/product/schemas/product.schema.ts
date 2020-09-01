import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    short_desc: {
        type: String
    },
    description: {
        type: String
    },
    time_period: {
        type: Date
    },
    start_at: {
        type: Date
    },
    price: {
        type: Number,
        required: true
    },
    visibility: {
        type: String,
        enum : ['private','publish', 'draft'],
        default: 'publish'
    },
    end_at: {
        type: Date
    },
    created_by: {
        type: Number
    },
    video: {
        type: String
    },
    product_code: {
        type: String,
        required: true
    },
    // event: {}
    form_type: {
        type: String,
        enum: ['small', 'medium'],
        default: 'small'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    }
});

ProductSchema.pre('save', async function (next: mongoose.HookNextFunction) {
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