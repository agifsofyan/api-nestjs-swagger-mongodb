import * as mongoose from 'mongoose';

let ThanksSchema = new mongoose.Schema({
    video: String,
    title: String,
    description: String,
})

let ModuleSchema = new mongoose.Schema({
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

let PostSchema = new mongoose.Schema({
    topic: {
      	type: mongoose.Schema.Types.ObjectId,
       	ref: 'Topic'
    },
    title: { type: String },
    desc: { type: String },
    images: { type: String },
    post_type: { type: String },
    placement: { type: String, default: 'none' },
    podcast: { url: { type: String } },
    webinar: {
       	type: mongoose.Schema.Types.ObjectId,
       	ref: 'Video'
    },
    video: {
       	type: mongoose.Schema.Types.ObjectId,
       	ref: 'Video'
    },
    tips: { type: String },
    author: {
       	type: mongoose.Schema.Types.ObjectId,
       	ref: 'Admin'
    },
    postdate: { type: Date, default: new Date() }
});

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
