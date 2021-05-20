import * as mongoose from 'mongoose';

const ThanksSchema = new mongoose.Schema({
    video: String,
    title: String,
    description: String,
})

const ModuleSchema = new mongoose.Schema({
    statement: [{ value: String }],
    question: [{ 
        value: String, 
        answers: [{ 
            answer: String, 
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
            datetime: Date 
        }] 
    }],
    mission: [{ 
        value: String, 
        completed: [{ 
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
            datetime: Date 
        }] 
    }],
    mind_map: [{ value: String }]
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
        text: true
    },
    desc: {
        type: String,
        text: true
    },
    images: [{ type: String }],

    module : ModuleSchema,
    podcast: [{ url: String }],
    video: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    placement: String,
    thanks: ThanksSchema,
    post_type: String,
    goal: String,
    post: [{
        topic: String,
        title: String,
        desc: String,
        images: String,
        post_type: String,
        placement: String,
        podcast: { url: String },
        video: String,
        webinar: String,
        author: String
    }]
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