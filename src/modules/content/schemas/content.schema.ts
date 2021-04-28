import * as mongoose from 'mongoose';

const ThanksSchema = new mongoose.Schema({
    video: String,
    title: String,
    description: String,
})

export const ContentSchema = new mongoose.Schema({
    isBlog: {
        type: Boolean,
        default: false //[true/false]: true to blog | false to fullfillment
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        text: true
    },
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

    module : {
        statement: [{ value: String }],
        question: [{ value: String }],
        mission: [{ value: String }],
        mind_map: [{ value: String }]
    },
    podcast: [{ url: String }],
    video: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    // tag: [{
    //     type: mongoose.Schema.Types.ObjectId,  // from tag name to tag ID
    //     ref: 'Tag',
    //     text: true
    // }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    placement: {
        type: String,
        default: null
    },
    // series: {
    //     type: Boolean,
    //     default: false,
    //     text: true
    // },
    thanks: ThanksSchema,
    // mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    post_type: String,
    goal: String
},{
	collection: 'contents',
	versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: false },
});

// create index search
ContentSchema.index({
    "product": 'text', title: 'text', desc: 'text', 'module.question': 'text', "module.statement": 'text', "module.mission": 'text', "tag": 'text', "placement": 'text', "series": 'text'
});

ContentSchema.pre('findOne', function() {
    this.populate({
        path: 'product',
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
            title:1,
            url:1,
        },
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
            name:1
        }
    })
});