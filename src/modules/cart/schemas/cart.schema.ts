import * as mongoose from 'mongoose';
import { expiring } from 'src/utils/order';

export const CartSchema = new mongoose.Schema({
    user_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        product_info: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        },
        whenAdd: {
            type: Date,
            default: Date.now
        },
        whenExpired: {
            type: Date,
            default: expiring(31)
        }
    }],
    modifiedOn: { type: Date }
},{
	collection: 'carts',
	versionKey: false
});

CartSchema.pre('findOne', function() {
    this.populate({
        path: 'user_info',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: "items.product_info",
        select: ({
            _id:1,
            name:1,
            type:1,
            visibility:1,
            price:1,
            sale_price:1,
            ecommerce:1,
            boe:1,
            bump:1
        }),
        populate: [
            { path: 'topic', select: {_id:1, name:1, slug:1, icon:1} },
            { path: 'agent', select: {_id:1, name:1} }
        ]
    })
});

CartSchema.pre('aggregate', function (){
    this.pipeline().unshift(
        {$lookup: {
            from: 'users',
            localField: 'user_info',
            foreignField: '_id',
            as: 'user_info'
        }},
        {$unwind: {
            path: '$user_info',
            preserveNullAndEmptyArrays: true
        }},
        {$unwind: {
            path: '$items',
            preserveNullAndEmptyArrays: true
            }
        },
        {$lookup: {
            from: 'products',
            localField: 'items.product_info',
            foreignField: '_id',
            as: 'items.product_info'
        }},
        {$unwind: '$items.product_info'},
        {$lookup: {
            from: 'topics',
            localField: 'items.product_info.topic',
            foreignField: '_id',
            as: 'items.product_info.topic'
        }},
        {$lookup: {
            from: 'administrators',
            localField: 'items.product_info.agent',
            foreignField: '_id',
            as: 'items.product_info.agent'
        }},
        { $project: {
                "user_info._id":1,
                "user_info.name":1,
                "user_info.email":1,
                "items._id":1,
                "items.quantity": 1,
                "items.whenExpired": 1,
                "items.product_info._id":1,
                "items.product_info.name":1,
                "items.product_info.slug":1,
                "items.product_info.code":1,
                "items.product_info.type":1,
                "items.product_info.visibility":1,
                "items.product_info.price":1,
                "items.product_info.sale_price":1,
                "items.product_info.bump":1,
                "items.product_info.boe":1,
                "items.product_info.ecommerce":1,
                "items.product_info.topic._id":1,
                "items.product_info.topic.name":1,
                "items.product_info.topic.slug":1,
                "items.product_info.topic.icon":1,
                "items.product_info.agent._id":1,
                "items.product_info.agent.name":1
        }},
        {$group: {
                _id: "$_id",
                user_info:{ $first: "$user_info" },
                items: { $push: "$items" },
        }},
        {$addFields: {
                "items.status": { $cond: {
                    if: { $gte: ["$items.whenExpired", new Date()] },
                    then: "ACTIVE",
                    else: "EXPIRED"
                }}
        }}
    )
})
