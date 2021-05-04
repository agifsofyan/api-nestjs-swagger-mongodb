import * as mongoose from 'mongoose';

export const GamificationSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    slug: {
        type: String,
        unique: true,
	    slug: "name"
    },
    icon: String,
    rating: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating',
    }
},{ 
	collection: 'gamifications',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
});
