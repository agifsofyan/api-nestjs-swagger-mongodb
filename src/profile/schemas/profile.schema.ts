import * as mongoose from 'mongoose';

export const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    bio: { type: String },
    birth_place: { type: String },
    birth_date: { type: Date },
    religion: { type: String },
    location: { type: String },
    experiences: [{
        title: { type: String, required: true },
        type: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String },
        current: { type: Boolean, default: false },
        startWorkAt: { type: Date, required: true },
        endWorkAt: { type: Date }
    }],
    achievements: [{
        title: { type: String, required: true },
        issuer: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, required: true },
    }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: null }
}, { collection: 'user_profiles' });