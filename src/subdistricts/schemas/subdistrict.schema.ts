import * as mongoose from 'mongoose';

export const SubdistrictSchema = new mongoose.Schema({
    urban: {
        type: String,
        required: true
    },
    sub_district: {
        type: String, 
        required: true
    },
    city: { 
        type: String,
        required: true
    },
    province_code: {
        type: String,
        required: true,
        unique: true
    },
    postal_code: { 
        type: Number,
        required: true
    }
}, {
    collection: 'subdistricts',
	versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});