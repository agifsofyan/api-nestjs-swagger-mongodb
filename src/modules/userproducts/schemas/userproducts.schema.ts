import * as mongoose from 'mongoose';

const AnswerModule = new mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId },
    answer: String
});

const MissionSchema = new mongoose.Schema({
    mission_id: { type: mongoose.Schema.Types.ObjectId },
    done: {type: Boolean, default: false }
});

export const UserProductScema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'User',
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'Product',
    },
    product_type: String,
	content_id: {
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'Content',
    },
	content_type: String, // fulfilment | blog
	content_kind: String, // webinar | video | tips
    content_placement: String, // strories | spotlight
    topic: [{
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'Topic',
    }],
    progress: {
        type: Number,
        default: 0
    }, // in percent
    order_invoice: String,
    expired_date: {type: Date, default: null},
    utm: {type: String, default: null},
    modules: {
        answers: [AnswerModule],
        mission_complete: [MissionSchema],
    }
},{
	collection: 'user_products',
	versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: false },
});

UserProductScema.index({
    type: 'text', progress: 'text', utm: 'text'
});