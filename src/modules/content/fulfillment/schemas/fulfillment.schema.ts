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
    mind_map: [{ value: String }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
})

const PostSchema = new mongoose.Schema({
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    },
    title: String,
    images: String,
    post_type: String,
    placement: String,
    podcast: { url: String },
    webinar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    tips: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
})

export const FulfillmentSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    thanks: ThanksSchema,
    goal: String,
    module : ModuleSchema,
    post: [PostSchema]
},{
	collection: 'fulfillments',
	versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: false },
});