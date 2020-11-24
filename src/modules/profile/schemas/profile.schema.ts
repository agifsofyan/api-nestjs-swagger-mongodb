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
    address: [{
        title: { type: String},
        // province_id: {type: mongoose.Types.ObjectId, ref: "Province" },
        // city_id: {type: mongoose.Types.ObjectId, ref: "Province" },
        province: String,
        city: String,
        districts: String,
        sub_district: String,
        detail_address: { type: String },
        postal_code: { type: Number }
    }],
    experience: [{
        title: { type: String, required: true },
        type: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String },
        current: { type: Boolean, default: false },
        startWorkAt: { type: Date, required: true },
        endWorkAt: { type: Date }
    }],
    achievement: [{
        title: { type: String, required: true },
        issuer: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, required: true },
    }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: null }
},{ 
	collection: 'user_profiles',
	versionKey: false
});