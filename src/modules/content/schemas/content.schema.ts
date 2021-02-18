import * as mongoose from 'mongoose';

export const AnswerSchema = new mongoose.Schema({
    answer: {type: String, text: true},
    answer_by: {type: String, text: true},
    answer_date: { type: Date, default: null },
    mission_complete: { type: Date, default: null }
})

export const ModuleSchema = new mongoose.Schema({
    statement: {type: String, text: true},
    question: {type: String, text: true},
    mission: {type: String, text: true},
    mind_map: [String]
})

export const ContentSchema = new mongoose.Schema({
    isBlog: {
        type: Boolean,
        default: false //[true/false]: true to fullfillment | false to blog
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

    module : [ModuleSchema],
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
    created_at: {
        type: Date,
        default: new Date()
    },
    placement: {
        type: String,
        default: null
    },
    series: {
        type: String,
        text: true
    }
},{
	collection: 'contents',
	versionKey: false
});

// create index search
ContentSchema.index({
    placement: 'text', title: 'text', desc: 'text', 'module.question': 'text', "module.statement": 'text',
    "module.mission": 'text', "module.answers.answer": 'text'
});

ContentSchema.pre('remove', async (next) => {
    await this.model('Tag').updateMany(
        {},
        { $pull: { content: this._id } }
    )
    next();
});