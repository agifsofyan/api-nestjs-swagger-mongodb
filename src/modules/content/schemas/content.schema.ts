import * as mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        text: true
    },
    "type": String,
})

const ThanksSchema = new mongoose.Schema({
    video: String,
    title: String,
    description: String,
})

const MentorSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
    }
})

export const ContentSchema = new mongoose.Schema({
    isBlog: {
        type: Boolean,
        default: false //[true/false]: true to blog | false to fullfillment
    },
    product: ProductSchema,
    topic: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        text: true
    }],
    title: {
        type: String,
        default: null,
        text: true
    },
    desc: {
        type: String,
        default: null,
        text: true
    },
    images: [{ type: String }],

    // module : {
    //     statement: [{ value: String }],
    //     question: [{ value: String }],
    //     mission: [{ value: String }],
    //     mind_map: [{ value: String }]
    // },
    module: Object,
    podcast: [{ url: String }],
    video: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    tag: [{
        type: mongoose.Schema.Types.ObjectId,  // from tag name to tag ID
        ref: 'Tag',
        text: true
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    placement: {
        type: String,
        default: null
    },
    series: {
        type: Boolean,
        default: false,
        text: true
    },
    thanks: ThanksSchema,
    mentor: MentorSchema,
    post_type: String
},{
	collection: 'contents',
	versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: false },
});

// create index search
ContentSchema.index({
    "product._id": 'text', "product.type": 'text', title: 'text', desc: 'text', 'module.question': 'text', "module.statement": 'text', "module.mission": 'text', "tag": 'text', "placement": 'text', "series": 'text'
});

ContentSchema.pre('find', function() {
    this.populate({
        path: 'product._id',
        select: {_id:1, name:1, type:1, visibility:1, price:1, sale_price:1, time_period:1, ecommerce:1}
    })
    this.populate({
        path: 'topic',
        select: {_id:1, name:1, slug:1, icon:1}
    })
    .populate({
        path: 'video',
        select: {
            _id:1, 
            url:1,
        },
        // populate: [
        //     { path: 'user', select: {_id:1, name:1, email:1, avatar:1} },
        //     { path: 'likes.liked_by', select: {_id:1, name:1, email:1, avatar:1} },
        //     { path: 'reactions.user', select: {_id:1, name:1, email:1, avatar:1} },
        //     { path: 'reactions.likes.liked_by', select: {_id:1, name:1, email:1, avatar:1} },
        //     { path: 'reactions.react_to.user', select: {_id:1, name:1, email:1, avatar:1} },
        // ]
    })
    .populate({ 
        path: 'tag',
        select: {
            _id:1, 
            name:1,
        }
    })
    .populate({ 
        path: 'author',
        select: {
            _id:1, 
            name:1,
        }
    })
});