import * as mongoose from 'mongoose';

export const CommentsSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    comments: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        comment: String,
        datetime: Date,
        author_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Administrator'
        },
        comment_parent_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        },
        likes: [{
            liked_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }]
    }]
},{
	collection: 'comments',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
});
