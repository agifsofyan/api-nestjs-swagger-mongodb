import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
	default: null
        //required: true
    },
    slug: {
        type: String,
	default: null,
	    unique: true
    },
    code: {
        type: String,
        unique: true,
	    default: null
    },
    type: {
        type: String,
        required: true,
        enum: [ "webinar", "digital", "ecommerce", "bonus" ],
        default: "webinar"
    },
    visibility: {
        type: String,
        enum: [ "publish", "private", "draft" ],
	    default: "publish"
    },

    headline: { type: String, default: null },
    subheadline: { type: String, default: null },
    description: { type: String, default: null },

    // feedback: String,
    time_period: { type: Number, default: 0 },

    price: {
        type: Number,
	default: 0
        //required: true
    },

    sale_price: {
        type: Number,
        default: 0
    },

    sale_method: {
        type: String,
        enum: ['normal', 'upsale', 'upgrade', 'crossale'],
	    default: "normal"
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
	    default: null
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
	    default: null
    },

    //reseller: String, // ref: User (Id & Name)

    image_url: [{ type: String}],
    image_bonus_url: { type: String },
    media_url: { type: String },

    section: [{
        title: { type: String },
        content: { type: String },
        image: { type: String }
    }],

    learn_about: [{
        title: { type: String },
        content: { type: String },
        note: { type: String}
    }],

    topic: [{
        type: mongoose.Schema.Types.Mixed,
        ref: 'Topic',
        //id: String,
        //name: String,
        //icon: String
    }],

    agent: [{
        type: mongoose.Schema.Types.ObjectId, //ObjectId,
        ref: 'Admin',
        //id: String,
        //name: String
    }],

    webinar: {
        date: { type: String },
        duration: { type: String },
    	start_time: { type: String },
    	client_url: { type: String },
    },

    ecommerce: {  
        weight: { type: Number },
        shipping_charges: { type: Boolean },
        stock: { type: Number }
    },

    feature: {
    	feature_onheader: {
            type: String
        },
    	feature_onpage: {
            type: String
        }
    },

    bump: [{
    	bump_name: { type: String },
    	bump_price: { type: Number },
        bump_weight: { type: Number },
        bump_image: { type: String },
        bump_heading: { type: String },
        bump_desc: { type: String },
    }],
},{
	collection: 'products',
	versionKey: false,
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

ProductSchema.pre('remove', function(next) {
    this.model('Content').remove({ product: this._id }).exec();
    this.model('Coupon').remove({ product_id: this._id }).exec();
    next();
});

ProductSchema.pre('find', function() {
    this.populate({
        path: 'created_by',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'updated_by',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'topic',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'agent',
        select: {_id:1, name:1, phone_number:1}
    })
});

ProductSchema.pre('findOne', function() {
    this.populate({
        path: 'created_by',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'updated_by',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'topic',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'agent',
        select: {_id:1, name:1, phone_number:1}
    })
});

// ProductSchema.pre('aggregate', async function () {
//     await this.pipeline().unshift(
//         {$lookup: {
//             from: 'administrators',
//             localField: 'created_by',
//             foreignField: '_id',
//             as: 'created_by'
//         }},
//         {$unwind: {
//             path: '$created_by',
//             preserveNullAndEmptyArrays: true
//         }},
//         {$unwind: {
//             path: '$items',
//             preserveNullAndEmptyArrays: true
//         }},
//         {$lookup: {
//             from: 'administrators',
//             localField: 'updated_by',
//             foreignField: '_id',
//             as: 'updated_by',
//         }},
//         {$unwind: {
//             path: '$updated_by',
//             preserveNullAndEmptyArrays: true
//         }},
//         {$lookup: {
//             from: 'topics',
//             localField: 'topic',
//             foreignField: '_id',
//             as: 'topic_info'
//         }},
//         {$unwind: {
//             path: '$topic_info',
//             preserveNullAndEmptyArrays: true
//         }},
//         {$lookup: {
//             from: 'administrators',
//             localField: 'agent',
//             foreignField: '_id',
//             as: 'agent'
//         }},
        // {$unwind: {
        //     path: '$agent',
        //     preserveNullAndEmptyArrays: true
        // }},
        // {$lookup: {
        //     from: 'products',
        //     localField: '_id',
        //     foreignField: 'coupon',
        //     as: 'coupons'
        // }},
        // {$unwind: {
        //     path: '$coupons',
        //     preserveNullAndEmptyArrays: true
        // }},
        // {$addFields: {
        //     coupons: '$coupons'
        // }}
        // {$addFields: {
        //     coupons: { $cond: {
        //         if: { $and: [ {status: { $not: "PAID" }}, {$gte: ["$expiry_date", new Date()]} ] },
        //         then: "$status",
        //         else: "EXPIRED"
        //     }}
        // }},
        // {$project: {
        //     "name": 1,
        //     "slug": 1,
        //     "code": 1,
        //     "visibility": 1,
        //     "type": 1,
        //     "price": 1,
        //     "sale_price": 1,
        //     "webinar": 1,
        //     "ecommerce": 1,
        //     "created_by": 1,
        //     "topic": 1,
        // }},
        // {$unwind: '$items.product_info.topic'},
        // {$group: {
        //     _id: "$_id",
        //     name:{ $first: "$name" },
        //     slug: { $first: "$slug" },
        //     code: { $first: "$code" },
        //     visibility: { $first: "$visibility" },
        //     price: { $first: "$price" },
        //     sale_price: { $first: "$sale_price" },
        //     webinar: { $first: "$webinar" },
        //     ecommerce: { $first: "$ecommerce" },
        //     created_by: { $first: "$created_by" },
        //     topic_info: { $push: "$topic_info" }
        // }}
//     )
// })

// create index search
ProductSchema.index({
    name: 'text', headline: 'text', description: 'text',
    feedback: 'text', section: 'text', 'feature.feature_onheader': 'text',
    'feature.feature_onpage': 'text', 'bump.bump_name': 'text',
    'topic.name': 'text', 'agent.name': 'text'
});
