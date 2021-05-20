import * as mongoose from 'mongoose';

export const BlogSchema = new mongoose.Schema({
    topic: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        text: true
    }],
    title: String,
    desc: String,
    images: [String],
    podcast: [{ 
        url: String,
        title: String
    }],
    video: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    author: String,
    placement: String // enum: [spotlight, stories] // checklist
},{
	collection: 'blogs',
	versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: false },
});