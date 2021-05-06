import * as mongoose from 'mongoose';

export const ActivitySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    comment: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment' 
    }],
    like: [{ 
        _id: { type: mongoose.Schema.Types.ObjectId },
        kind: String 
    }], // video, content, product, comment, reaction
    share: [{ 
        type: mongoose.Schema.Types.ObjectId 
    }],
    comment_reply: [{ 
        type: mongoose.Schema.Types.ObjectId 
    }],
    review: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Review' 
    }],
    rating: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Rating' 
    }],
    progress: [{
        _id: { type: mongoose.Schema.Types.ObjectId }, 
        kind: String,
        datetime: Date
    }], // video, content, product
},{
	collection: 'activities',
	versionKey: false
});
