import * as mongoose from 'mongoose';

export const UserProductScema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'User',
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'Product',
    },
    product_type: String,
	content: {
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'Content',
    },
	content_type: String,
    topic: [{
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'Topic',
    }],
    progress: {
        type: Number,
        default: 0
    }, // in percent
    utm: {type: String, default: null},
    expired_date: {type: Date, default: null},
},{
	collection: 'user_products',
	versionKey: false
});

UserProductScema.index({
    type: 'text', progress: 'text', utm: 'text'
});

UserProductScema.pre('find', function() {
    // this.populate({
    //     path: 'user',
    //     select: {_id:1, name:1, email: 1, phone_number: 1}
    // })
    this.populate({
        path: 'product',
        select: {_id:1, name:1, slug:1, code:1, visibility:1}
    })
    .populate({
        path: 'topic',
        select: {_id:1, name:1, slug:1, icon:1}
    })
});

UserProductScema.pre('findOne', function() {
    // this.populate({
    //     path: 'user',
    //     select: {_id:1, name:1, email: 1, phone_number: 1}
    // })
    this.populate({
        path: 'product'
    })
    .populate({
        path: 'topic',
        select: {_id:1, name:1, slug:1, icon:1}
    })
});