import * as mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema({
    liked_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const ReactionSchema = new mongoose.Schema({
    react_to: {
        id: {
            type: mongoose.Schema.Types.ObjectId
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    removed: {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Administrator'
        },
        deleted_at: Date
    },
    // reactions: [],
    likes: [LikeSchema],
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: null },
});

export const CommentSchema = new mongoose.Schema({
    type: String, // product | content | video
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    content: {
        type: mongoose.Schema.Types.ObjectId,
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: String,
    removed: {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        deleted_at: {
            type: Date,
            default: null
        }
    },
    reactions: [ReactionSchema],
    likes: [LikeSchema],
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: null },
},{
	collection: 'comments',
	versionKey: false,
});
