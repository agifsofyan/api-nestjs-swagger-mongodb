import * as mongoose from 'mongoose';

export const AnswerSchema = new mongoose.Schema({
    answer: String,
    answer_by: String,
    answer_date: { type: Date, default: null },
    mission_complete: { type: Date, default: null }
})

export const ModuleSchema = new mongoose.Schema({
    statement_list: String,
    question_list: String,
    mission_list: String,
    mind_map: [String],
    answers: AnswerSchema
})

export const ContentSchema = new mongoose.Schema({
    isBlog: {
        type: Boolean,
        default: false //[true/false]: true to fullfillment | false to blog
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
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

    module : [ModuleSchema],
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
    },
    placement: {
        type: String,
        default: null
    },
    series: String
},{
	collection: 'contents',
	versionKey: false
});

// create index search
ContentSchema.index({
    topic: 'text', product: 'text', tag: 'text', author: 'text', placement: 'text',
    title: 'text', 'module.question': 'text', desc: 'text', "module.statement_list": 'text', "module.question_list": 'text',
    "module.mission_list": 'text', "module.answers.answer": 'text'
});

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
        path: 'tag',
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
        path: 'tag',
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

// ContentSchema.pre('aggregate', function (){
//     this.pipeline().unshift(
//         {$lookup: {
//                 from: 'products',
//                 localField: 'product',
//                 foreignField: '_id',
//                 as: 'product'
//         }},
//         {$unwind: {
//                 path: '$product',
//                 preserveNullAndEmptyArrays: true
//         }},
//         {$lookup: {
//                 from: 'topics',
//                 localField: 'topic',
//                 foreignField: '_id',
//                 as: 'topic'
//         }},
//         {$lookup: {
//                 from: 'administrators',
//                 localField: 'author',
//                 foreignField: '_id',
//                 as: 'author'
//         }},
//         {$unwind: {
//                 path: '$author',
//                 preserveNullAndEmptyArrays: true
//         }},
//         {$lookup: {
//             from: 'tags',
//             localField: 'tag',
//             foreignField: '_id',
//             as: 'tag'
//         }},
//         {$unwind: {
//                 path: '$tag',
//                 preserveNullAndEmptyArrays: true
//         }},
//         { $project: {
//             name: 1,
//             isBlog: 1,
//             cover_img: 1,
//             "product._id":1, 
//             "product.name":1, 
//             "product.slug":1, 
//             "product.code":1, 
//             "product.type":1, 
//             "product.visibility":1,
//             "topic._id":1, 
//             "topic.name":1, 
//             "topic.slug":1, 
//             "topic.icon":1,
//             title: 1,
//             desc: 1,
//             images: 1,
//             module : 1,
//             podcast: 1,
//             video: 1,
//             "author._id":1, 
//             "author.name":1,
//             "tag._id":1, 
//             "tag.name":1,
//             created_at: 1
//         }}
//     )
// })
