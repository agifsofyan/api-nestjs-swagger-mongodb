import * as mongoose from 'mongoose';
import { expiring } from 'src/utils/order';

export const OrderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        variant: {
            type: String,
            default: null
        },
        note: {
            type: String,
            default: null,
        },
        is_bump: {
            type: Boolean,
            default: false
        },
        quantity: {
            type: Number,
            default: 1
        },
        bump_price: {
            type: Number,
            default: 0
        },
        sub_price: {
            type: Number,
            default: 0
        }
    }],

    coupon: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Coupon',
        name: String,
        code: String,
        value: Number,
        max_discount: Number
    },

    payment: {
        method: { 
	        type: mongoose.Schema.Types.Mixed, 
	        ref: 'PaymentMethod',
            name: String,
            info: String
        },
        status: String,
        pay_uid: String,
        external_id: String,
        payment_id: String,
        payment_code: String,
        callback_id: String,
	    phone_number: String
    },

    shipment: {
        address_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        shipment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shipment',
            default: null
        }
    },

    total_qty: Number,
    total_price: Number,
    invoice: String,

    create_date: {
        type: Date,
        default: new Date()
    },

    expiry_date: {
        type: Date,
        default: expiring(2)
    },

    status: {
        type: String,
        enum: [ "PAID", "UNPAID", "PENDING", "EXPIRED"],
        default: "PENDING"
    }
},{
    collection: 'orders',
    versionKey: false
}); 

OrderSchema.pre('find', function() {
    this.populate({
	path: 'user_id',
	select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'items.product_id',
	alias: 'product_info',
	select: ({ 
	    _id:1, 
	    name:1, 
	    type:1, 
	    visibility:1, 
	    price:1, 
	    sale_price:1, 
	    ecommerce:1, 
	    webinar:1,
	    bump:1
	}),
	product_info: 1,
	populate: [
	    { path: 'topic', select: {_id:1, name:1, slug:1, icon:1} },
	    { path: 'agent', select: {_id:1, name:1} }
	]
    })
    .populate({ 
	path: 'shipment.shipment_id',
	select: {
	    _id:1, 
	    to:1, 
	    "parcel_job.dimension":1,
	    "parcel_job.pickup_service_level":1,
	    "parcel_job.pickup_date":1,
	    "parcel_job.delivery_start_date":1,
	    service_type:1,
	    service_level:1,
	    requested_tracking_number:1
	}
    })
});

/*
OrderSchema.pre('aggregate', function(){
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_info'
                },
                $unwind: {
                    path: '$user_info',
                    preserveNullAndEmptyArrays: true
                },
                $unwind: {
                    path: '$items',
                    preserveNullAndEmptyArrays: true
                },
                $lookup: {
                    from: 'products',
                    localField: 'items.product_id',
                    foreignField: '_id',
                    as: 'items.product_info'
                },
                $unwind: '$items.product_info',
                $lookup: {
                    from: 'shipments',
                    localField: 'shipment_id',
                    foreignField: '_id',
                    as: 'shipment.shipment_info'
                },
                $unwind: {
                    path: '$shipment.shipment_info',
                    preserveNullAndEmptyArrays: true
                },
                $addFields: {
                    "shipment.shipment_info": "$shipment.shipment_info",
                    status: { $cond: {
                        if: { $and: [ {status: { $not: "PAID" }}, {$gte: ["$expiry_date", new Date()]} ] },
                        then: "$status",
                        else: "EXPIRED"
                    }}
                },
                $project: {
                    "user_info._id": 1,
                    "user_info.name": 1,
                    "user_info.email": 1,
                    "user_info.phone_number": 1,
                    "payment": 1,
                    "items.variant": 1,
                    "items.note": 1,
                    "items.quantity": 1,
                    "items.is_bump": 1,
                    "items.bump_price": 1,
                    "items.sub_price": 1,
                    "items.product_info._id": 1,
                    "items.product_info.name": 1,
                    "items.product_info.type": 1,
                    "items.product_info.visibility": 1,
                    "items.product_info.price": 1,
                    "items.product_info.sale_price": 1,
                    "items.product_info.bump": 1,
                    "items.product_info.topic": 1,
                    "items.product_info.created_by": 1,
                    "items.product_info.agent": 1,
                    "shipment.shipment_info": 1,
                    "total_qty": 1,
                    "total_price": 1,
                    "create_date": 1,
                    "expiry_date": 1,
                    "invoice": 1,
                    "status": 1
                },
                $group: {
                    _id: "$_id",
                    user_info:{ $first: "$user_info" },
                    items: { $push: "$items" },
                    item_count: { $sum: 1 },
                    payment: { $first: "$payment" },
                    shipment: { $first: "$shipment" },
                    total_qty: { $first: "$total_qty" },
                    total_price: { $first: "$total_price" },
                    create_date: { $first: "$create_date" },
                    expiry_date: { $first: "$expiry_date" },
                    invoice: { $first: "$invoice" },
                    status: { $first: "$status" }
                }
})
*/

/**
TopicSchema.pre('remove', function(next) {
    this.model('Product').remove({ topic: this._id }).exec();
    this.model('Content').remove({ topic: this._id }).exec();
    next();
});
*/

// create index search
OrderSchema.index({
    user_id: 'text', 'items.product_id': 'text', 'items.sub_price': 'text', 
    'coupon.coupon_id': 'text', 'payment.method.id': 'text', 'payment.method.name': 'text',
    'payment.status': 'text', 'payment.external_id': 'text', 'payment.phone_number': 'text', 'payment.payment_code': 'text',
    'shipment.address_id': 'text', 'shipment.shipment_id': 'text',
    total_qty: 'text', total_price: 'text', invoice: 'text',
    create_date : 'text', expiry_date: 'date', status: 'text'
});
