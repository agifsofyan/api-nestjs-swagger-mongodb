import * as mongoose from 'mongoose';
// import { type } from 'os';


export const ContentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isBlog: {
        type: Boolean,
        default: false //[true/false]: true to fullfillment | false to blog
    },
    cover_img: String,
    product: [{
        type: mongoose.Schema.Types.Mixed,
        ref: 'Product'
    }],
    topic: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    content: {
        type: String,
	default: null
    },
    images: [{ type: String }],

    module : [{ question: String }],
    podcast: [{ url: String }],
    video: [{ url: String }],
    tag: [{ type: String }]
},{
	collection: 'contents',
	versionKey: false,
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// create index search
ContentSchema.index({ name: 'text', topic: 'text', short_content: 'text', content: 'text' });
