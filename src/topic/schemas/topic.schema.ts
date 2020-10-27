import * as mongoose from 'mongoose';

export const TopicSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    slug: { type: String },
    icon: { type: String },
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});