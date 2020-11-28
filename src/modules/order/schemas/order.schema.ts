import * as mongoose from 'mongoose';
import { expiring } from 'src/utils/order';

export const OrderItemSchema = new mongoose.Schema({
    	product_info: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'Product',
	    alias: "product_id"
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
});

export const OrderSchema = new mongoose.Schema({
    user_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        alias: "user_id"
    },

    items: [OrderItemSchema],

    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        name: String,
        code: String,
        value: Number,
        max_discount: Number
    },

    payment: {
        method: { 
	        type: mongoose.Schema.Types.ObjectId, 
	        ref: 'PaymentMethod'
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
        shipment_info: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shipment',
            alias: "shipment_id",
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
        path: 'user_info',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'items.product_info',
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
        path: 'shipment.shipment_info',
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

OrderSchema.pre('findOne', function() {
    this.populate({
        path: 'user_info',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'items.produc_info',
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
        path: 'shipment.shipment_info',
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

// OrderSchema.pre('aggregate', async function () {
    // await this.pipeline().unshift(
    //     {$lookup: {
    //         from: 'users',
    //         localField: 'user_info',
    //         foreignField: '_id',
    //         as: 'user_info'
    //     }},
    //     {$unwind: {
    //         path: '$user_info',
    //         preserveNullAndEmptyArrays: true
    //     }},
    //     {$unwind: {
    //         path: '$items',
    //         preserveNullAndEmptyArrays: true
    //     }},
    //     {$lookup: {
    //         from: 'products',
    //         localField: 'items.product_info',
    //         foreignField: '_id',
    //         as: 'items.product_info',
    //     }},
    //     {$unwind: '$items.product_info'},
    //     {$lookup: {
    //         from: 'shipments',
    //         localField: 'shipment_info',
    //         foreignField: '_id',
    //         as: 'shipment.shipment_info'
    //     }},
    //     {$unwind: {
    //         path: '$shipment.shipment_info',
    //         preserveNullAndEmptyArrays: true
    //     }},
    //     {$addFields: {
    //         status: { $cond: {
    //             if: { $and: [ {status: { $not: "PAID" }}, {$gte: ["$expiry_date", new Date()]} ] },
    //             then: "$status",
    //             else: "EXPIRED"
    //         }}
    //     }},
    //     {$project: {
    //         "user_info._id": 1,
    //         "user_info.name": 1,
    //         "user_info.email": 1,
    //         "user_info.phone_number": 1,
    //         "payment": 1,
    //         "items.variant": 1,
    //         "items.note": 1,
    //         "items.quantity": 1,
    //         "items.is_bump": 1,
    //         "items.bump_price": 1,
    //         "items.sub_price": 1,
    //         "items.product_info._id": 1,
    //         "items.product_info.name": 1,
    //         "items.product_info.type": 1,
    //         "items.product_info.visibility": 1,
    //         "items.product_info.price": 1,
    //         "items.product_info.sale_price": 1,
    //         "items.product_info.bump": 1,
    //         "items.product_info.topic": 1,
    //         "items.product_info.agent": 1,
    //         "shipment.shipment_info": 1,
    //         "total_qty": 1,
    //         "total_price": 1,
    //         "create_date": 1,
    //         "expiry_date": 1,
    //         "invoice": 1,
    //         "status": 1,
    //     }},
    //     {$unwind: '$items.product_info.topic'},
    //     {$group: {
    //         _id: "$_id",
    //         user_info:{ $first: "$user_info" },
    //         item_count: { $sum: 1 },
    //         items: { $push: "$items" },
    //         payment: { $first: "$payment" },
    //         shipment: { $first: "$shipment" },
    //         total_qty: { $first: "$total_qty" },
    //         total_price: { $first: "$total_price" },
    //         create_date: { $first: "$create_date" },
    //         expiry_date: { $first: "$expiry_date" },
    //         invoice: { $first: "$invoice" },
    //         status: { $first: "$status" }
    //     }}
    // )

//     await this.pipeline().unshift(
//         {$lookup: {
//             from: 'users',
//             localField: 'user_info',
//             foreignField: '_id',
//             as: 'user_info'
//         }},
//         {$unwind: {
//             path: '$user_info',
//             preserveNullAndEmptyArrays: true
//         }},
//         {$unwind: {
//             path: '$shipment.shipment_info',
//             preserveNullAndEmptyArrays: true
//         }},
//         {$unwind: {
//             path: '$items',
//             preserveNullAndEmptyArrays: true
//         }},
//         {$lookup: {
//             from: 'products',
//             localField: 'items.product_info',
//             foreignField: '_id',
//             as: 'items.product_info'
//         }},
//         {$unwind: '$items.product_info'},
//          {$addFields: {
//             status: { $cond: {
//                 if: { $and: [ {status: { $not: "PAID" }}, {$gte: ["$expiry_date", new Date()]} ] },
//                 then: "$status",
//                 else: "EXPIRED"
//             }}
//         }},
//         {$project: {
//             "user_info._id": 1,
//             "user_info.name": 1,
//             "user_info.email": 1,
//             "user_info.phone_number": 1,
//             payment: 1,
//             items: 1,
//             total_qty: 1,
//             total_price: 1,
//             create_date: 1,
//             expiry_date: 1
//         }},
//         {$group: {
//             _id: {
//                 order_id: "$_id",
//                 user_info: "$user_info",
//                 payment: "$payment",
//                 total_qty: "$total_qty",
//                 total_price: "$total_price",
//                 create_date: "$create_date",
//                 expiry_date: "$expiry_date",
//             },
//             items: { $push: "$items" },
//             count: { $sum: 1 }
//         }},
//         { $sort : { "user_info._id": 1, create_date: 1 } },
//         // { $group: {
//         //     _id: "$_id.user_id",
//         //     user_info:{ $first: "$_id.user_info" },
//         //     orders_count: { $sum: 1 },
//         //     orders: {
//         //         $push: {
//         //             order_id: "$_id.order_id",
//         //             payment: "$_id.payment",
//         //             items_count: "$count",
//         //             items: "$items",
//         //             total_qty: "$_id.total_qty",
//         //             total_price: "$_id.total_price",
//         //             create_date: "$_id.create_date",
//         //             expiry_date: "$_id.expiry_date"
//         //         }
//         //     }
//         // }},
//         // { $sort : { _id: -1 } }
//     )
// })

OrderSchema.pre('remove', function(next) {
    this.model('Shipment').remove({ "shipment.shipment_info": this._id }).exec();
    next();
});

// create index search
OrderSchema.index({
    user_id: 'text', 'items.product_id': 'text', 'items.sub_price': 'text', 
    'coupon.coupon_id': 'text', 'payment.method.id': 'text', 'payment.method.name': 'text',
    'payment.status': 'text', 'payment.external_id': 'text', 'payment.phone_number': 'text', 'payment.payment_code': 'text',
    'shipment.address_id': 'text', 'shipment.shipment_id': 'text',
    total_qty: 'text', total_price: 'text', invoice: 'text',
    create_date : 'text', expiry_date: 'date', status: 'text'
});
