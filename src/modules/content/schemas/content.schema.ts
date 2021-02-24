import * as mongoose from 'mongoose';

const StatementSchema = new mongoose.Schema({
    value: {type: String, text: true}
})

const QuestionSchema = new mongoose.Schema({
    value: {type: String, text: true}
})

const MissionSchema = new mongoose.Schema({
    value: {type: String, text: true}
})

const MindMapSchema = new mongoose.Schema({
    value: {type: String, text: true}
})

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

    module : {
        statement: [StatementSchema],
        question: [QuestionSchema],
        mission: [MissionSchema],
        mind_map: [MindMapSchema]
    },
    podcast: [{ url: String }],
    video: [{ url: String }],
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

// ContentSchema.pre('remove', async (next) => {
//     await this.model('Tag').updateMany(
//         {},
//         { $pull: { content: this._id } }
//     )
//     next();
// });