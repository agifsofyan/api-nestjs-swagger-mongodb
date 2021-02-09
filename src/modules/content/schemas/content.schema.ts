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
    },
    progress: {
        type: Number,
        text: true
    } // in percent
},{
	collection: 'contents',
	versionKey: false
});

// create index search
ContentSchema.index({
    placement: 'text', title: 'text', desc: 'text', 'module.question': 'text', "module.statement": 'text',
    "module.mission": 'text', "module.answers.answer": 'text'
});

// ContentSchema.index({
//     placement: 1, title: 1, desc: 1, 'module.question': 1, "module.statement": 1, "module.mission": 1, "module.answers.answer": 1
// });

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

// const query = await this.contentModel.find({ $text: { $search: 'descriptor' } }) //.skip(Number(skip)).limit(Number(limit)).sort(sort)
		// const query = await this.contentModel.aggregate([
		// 	{$match: match},
		// 	{$lookup: {
        //         from: 'products',
        //         localField: 'product',
        //         foreignField: '_id',
        //         as: 'product'
		// 	}},
		// 	{$unwind: {
		// 			path: '$product',
		// 			preserveNullAndEmptyArrays: true
		// 	}},
		// 	{$lookup: {
		// 			from: 'topics',
		// 			localField: 'topic',
		// 			foreignField: '_id',
		// 			as: 'topic'
		// 	}},
		// 	{$lookup: {
		// 			from: 'administrators',
		// 			localField: 'author',
		// 			foreignField: '_id',
		// 			as: 'author'
		// 	}},
		// 	{$unwind: {
		// 			path: '$author',
		// 			preserveNullAndEmptyArrays: true
		// 	}},
		// 	{$lookup: {
		// 		from: 'tags',
		// 		localField: 'tag',
		// 		foreignField: '_id',
		// 		as: 'tag'
		// 	}},
		// 	{ $project: {
		// 		isBlog: 1,
		// 		"product._id":1, 
		// 		"product.name":1, 
		// 		"product.slug":1, 
		// 		"product.code":1, 
		// 		"product.type":1, 
		// 		"product.visibility":1,
		// 		"topic._id":1, 
		// 		"topic.name":1, 
		// 		"topic.slug":1, 
		// 		"topic.icon":1,
		// 		title: 1,
		// 		desc: 1,
		// 		images: 1,
		// 		module : 1,
		// 		podcast: 1,
		// 		video: 1,
		// 		"author._id":1, 
		// 		"author.name":1,
		// 		"tag._id":1, 
		// 		"tag.name":1,
		// 		placement: 1,
		// 		series: 1,
		// 		created_at: 1
		// 	}},
		// 	{$limit: !limit ? await this.contentModel.countDocuments() : Number(limit)},
		// 	{$skip: Number(skip)},
		// 	{$sort: sort}
		// ])