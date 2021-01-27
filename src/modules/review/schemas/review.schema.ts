import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

export const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    opini: String
},{ 
	collection: 'reviews',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
});

ReviewSchema.pre('find', function() {
    this.populate({
        path: 'user',
        select: {_id:1, name:1, phone_number:1, email:1}
    })
    .populate({
    	path: 'product',
    	select: {_id:1, name:1, code:1, slug:1, type:1, visibility:1}
    })
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