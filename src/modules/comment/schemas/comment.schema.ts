import * as mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema({
    liked_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const ReactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: String,
    removed: {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Administrator'
        },
        deleted_at: Date
    },
    reactions: [],
    likes: [LikeSchema],
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: null },
});

export const CommentSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: String,
    removed: {
        author: String,
        deleted_at: Date,
    },
    reactions: [ReactionSchema],
    likes: [LikeSchema],
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: null },
},{
	collection: 'comments',
	versionKey: false,
});
