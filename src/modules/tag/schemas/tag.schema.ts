import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

const ObjectId = mongoose.Types.ObjectId;

export const TagSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: []
    }],
    content: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
        default: []
    }],
    order: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: []
    }],
    coupon: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: []
    }]
},{ 
	collection: 'tags',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: false }, 
});

// TagSchema.pre('find', function() {
//     this.populate({
//         path: 'product',
//         select: {_id:1, name:1, slug:1, code:1}
//     })
//     .populate({
//         path: 'content',
//         select: {_id:1, name:1, isBlog:1}
//     })
//     .populate({
//         path: 'order',
//         select: {_id:1, user_info:1},
//         populate: {
//             path: 'order.user_info',
//             select: {_id:1, name:1, phone_number:1}
//         }
//     })
//     .populate({
//         path: 'coupon',
//         select: {_id:1, name:1, isBlog:1}
//     })
//     .sort({ name: 1 })
// });

// TagSchema.pre('findOne', function() {
//     this.populate({
//         path: 'product',
//         select: {_id:1, name:1, slug:1, code:1}
//     })
//     .populate({
//         path: 'order',
//         select: {_id:1, user_info:1},
//         populate: { 
//             path: 'order.user_info', 
//             select: {_id:1, name:1, phone_number:1} 
//         }
//     })
//     .populate({
//         path: 'coupon',
//         select: {_id:1, name:1, isBlog:1}
//     })
//     .populate({
//         path: 'content',
//         select: {_id:1, name:1, isBlog:1}
//     })
// });

/**
TagSchema.pre('aggregate', function() {
    this.pipeline().unshift(
        {$lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'product'
        }},
        {$unwind: {
            path: '$product',
            preserveNullAndEmptyArrays: true
        }},
        {$lookup: {
            from: 'coupons',
            localField: 'coupon',
            foreignField: '_id',
            as: 'coupon'
        }},
        {$unwind: {
            path: '$coupon',
            preserveNullAndEmptyArrays: true
        }},
        {$lookup: {
            from: 'contents',
            localField: 'content',
            foreignField: '_id',
            as: 'content'
        }},
        {$unwind: {
            path: '$content',
            preserveNullAndEmptyArrays: true
        }},
        {$lookup: {
            from: 'orders',
            localField: 'order',
            foreignField: '_id',
            as: 'order'
        }},
        {$unwind: {
            path: '$order',
            preserveNullAndEmptyArrays: true
        }},
        {$lookup: {
            from: 'users',
            localField: 'order.user_info',
            foreignField: '_id',
            as: 'order.user_info'
        }},
        { $project: {
            _id:1,
            name:1,
            "product._id":1,
            "product.name":1,
            "content._id":1,
            "content.name":1,
            "content.isBlog":1,
            "coupon._id":1,
            "coupon.name":1,
            "coupon.type":1,
            "order._id":1,
            "order.user_info._id":1,
            "order.user_info.name":1,
            "order.user_info.phone_number":1,
        }}
    )
})
*/

// create index search
TagSchema.index({
    name: 'text', product: 'text', content: 'text', order: 'text', coupon: 'text'
});
