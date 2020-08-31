import * as mongoose from 'mongoose';

export const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    birth_place: {
        type: String
    },
    birth_date: {
        type: String
    },
    religion: {
        type: String
    },
    // provinceId: {
    //     type: mongoose.Types.ObjectId,
    //     ref: 'RajaOngkirProvince'
    // },
    // cityId: {
    //     type: mongoose.Types.ObjectId,
    //     ref: 'RajaOngkirCity'
    // },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    }
}, { collection: 'user_profiles' });