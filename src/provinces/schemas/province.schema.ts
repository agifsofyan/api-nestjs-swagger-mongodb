import * as mongoose from 'mongoose';

export const ProvinceSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    name_en: { 
        type: String,
        required: true,
	    unique: true
    }
}, {
    collection: 'provinces',
	versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});