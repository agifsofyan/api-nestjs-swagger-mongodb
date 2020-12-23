import * as mongoose from 'mongoose';

export const HashTagSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    content: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    }]
},{ 
	collection: 'hashtags',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: false }, 
});

HashTagSchema.pre('find', function() {
    this.populate({
        path: 'Content',
        select: {_id:1, name:1, isBlog:1}
    })
    .sort({ name: 1 })
});

HashTagSchema.pre('findOne', function() {
    this.populate({
        path: 'Content',
        select: {_id:1, name:1, isBlog:1}
    })
});

// create index search
HashTagSchema.index({
    name: 'text', content: 'text'
});
