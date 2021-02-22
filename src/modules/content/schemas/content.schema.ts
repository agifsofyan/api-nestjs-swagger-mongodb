import * as mongoose from 'mongoose';

export const AnswerSchema = new mongoose.Schema({
    answer: {type: String, text: true},
    answer_by: {type: String, text: true},
    answer_date: { type: Date, default: null },
    mission_complete: { type: Date, default: null }
})

export const StatementSchema = new mongoose.Schema({
    value: {type: String, text: true}
})

export const QuestionSchema = new mongoose.Schema({
    value: {type: String, text: true}
})

export const MissionSchema = new mongoose.Schema({
    value: {type: String, text: true}
})

export const MindMapSchema = new mongoose.Schema({
    value: {type: String, text: true}
})

export const ModuleSchema = new mongoose.Schema({
    statement: [StatementSchema],
    question: [QuestionSchema],
    mission: [MissionSchema],
    mind_map: [MindMapSchema]
})

export const ProductSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        text: true
    },
    type: String,
})

export const TahnksSchema = new mongoose.Schema({
    video: String,
    title: String,
    description: String,
})

export const MentorSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'Product',
        // text: true
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

    module : ModuleSchema,
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
    thanks: TahnksSchema,
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