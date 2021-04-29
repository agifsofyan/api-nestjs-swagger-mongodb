import * as mongoose from 'mongoose';

export const VideoSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    title: String,
    url: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    viewer: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        ip: String,
        on_datetime: Date
    }],
    likes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        ip: String,
        on_datetime: Date
    }],
    url_share: {
        twitter: String,
        facebook: String,
        linkedin: String
    },
    shared: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        ip: String,
        to: String,
        on_datetime: Date
    }],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    start_datetime: Date,
    duration: Number,
    isWebinar: { type: Boolean, default: false },
    platform: { type: String, default: 'aws-s3' }, // zoom, google-meet, youtube, aws-s3
},{ 
	collection: 'videos',
	versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: false }
});
