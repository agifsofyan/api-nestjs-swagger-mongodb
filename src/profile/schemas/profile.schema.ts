import * as mongoose from 'mongoose';

export const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    birth_place: {
        type: String
    },
    birth_date: {
        type: Date
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
});