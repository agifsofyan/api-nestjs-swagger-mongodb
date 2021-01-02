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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    topic: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    title: {
        type: String,
	    default: null
    },
    desc: {
        type: String,
	    default: null
    },
    images: [{ type: String }],

    module : [{ question: String }],
    podcast: [{ url: String }],
    video: [{ url: String }],
    tag: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    created_at: {
        type: Date,
        default: new Date()
    }
},{
	collection: 'contents',
	versionKey: false
});

// create index search
ContentSchema.index({ name: 'text', topic: 'text', short_content: 'text', desc: 'text' });

ContentSchema.pre('find', function() {
    this.populate({
        path: 'product',
        select: {_id:1, name:1, slug:1, code:1, type:1, visibility:1}
    })
    .populate({
        path: 'topic',
        select: {_id:1, name:1, slug:1, icon:1}
    })
    .populate({
        path: 'author',
        select: {_id:1, name:1}
    })
    .populate({
        path: 'Tag',
        select: {_id:1, name:1}
    })
});

ContentSchema.pre('findOne', function() {
    this.populate({
        path: 'product',
        select: {_id:1, name:1, slug:1, code:1, type:1, visibility:1}
    })
    .populate({
        path: 'topic',
        select: {_id:1, name:1, slug:1, icon:1}
    })
    .populate({
        path: 'author',
        select: {_id:1, name:1}
    })
    .populate({
        path: 'Tag',
        select: {_id:1, name:1}
    })
});

ContentSchema.pre('remove', async (next) => {
    await this.model('Tag').updateMany(
        {},
        { $pull: { content: this._id } }
    )
    next();
});
