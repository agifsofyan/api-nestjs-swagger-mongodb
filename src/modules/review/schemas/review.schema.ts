import * as mongoose from 'mongoose';

export const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        alias: 'user_id'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    },
    opini: String
},{ 
	collection: 'reviews',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
});

ReviewSchema.pre('findOne', function() {
    this.populate({
        path: 'user',
        select: {_id:1, name:1, phone_number:1, email:1}
    })
    .populate({
    	path: 'product',
    	select: {_id:1, name:1, code:1, slug:1, type:1, visibility:1}
    })
});