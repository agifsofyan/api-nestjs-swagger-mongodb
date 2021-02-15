import * as mongoose from 'mongoose';

export const RatingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    kind: { type: String },
    kind_id: { type: mongoose.Schema.Types.ObjectId },
    rate: { type: Number }
},{
	collection: 'ratings',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
});
