import * as mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
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
    },
    utm: String
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
        price: Number,
        shipment_info: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shipment',
            alias: "shipment_id",
            default: null
        }
    },

    total_bump: Number,
    dicount_value: Number,
    total_qty: Number,
    sub_total_price: Number,
    unique_number: { type: Number, default: 0 },
    total_price: Number,
    invoice: String,

    expiry_date: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        // enum: [ "PAID", "UNPAID", "PENDING", "EXPIRED"],
        default: "PENDING"
    },

    email_job: {
        pre_payment: [{
            type: String,
            default: null
        }],
        after_payment: {
            type: String,
            default: null
        } 
    }
},{
    collection: 'orders',
    versionKey: false,
    timestamps: { createdAt: 'create_date', updatedAt: false },
});

OrderSchema.pre('aggregate', function (){
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
                from: 'payment_methods',
                localField: 'payment.method',
                foreignField: '_id',
                as: 'payment.method'
        }},
        {$unwind: {
                path: '$payment.method',
                preserveNullAndEmptyArrays: true
        }},
        // {$lookup: {
        //         from: 'shipments',
        //         localField: 'shipment.shipment_info',
        //         foreignField: '_id',
        //         as: 'shipment_info'
        // }},
        // {$unwind: {
        //         path: '$shipment_info',
        //         preserveNullAndEmptyArrays: true
        // }},
        {$unwind: {
                path: '$items',
                preserveNullAndEmptyArrays: true
        }},
        {$lookup: {
                from: 'products',
                localField: 'items.product_info',
                foreignField: '_id',
                as: 'items.product_info'
        }},
        {$unwind: {
            path: '$items.product_info',
            preserveNullAndEmptyArrays: true
        }},
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
                "user_info.phone_number":1,
                "items._id":1,
                "items.variant": 1,
                "items.note": 1,
                "items.is_bump": 1,
                "items.quantity": 1,
                "items.bump_price": 1,
                "items.sub_price": 1,
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
                // "items.product_info.boe":1,
                // "items.product_info.ecommerce":1,
                "items.product_info.topic._id":1,
                "items.product_info.topic.name":1,
                "items.product_info.topic.slug":1,
                "items.product_info.topic.icon":1,
                "items.product_info.agent._id":1,
                "items.product_info.agent.name":1,
                "items.product_info.time_period":1,
                "items.utm":1,
                "coupon.name":1,
                "coupon.code":1,
                "coupon.type":1,
                "coupon.value":1,
                "coupon.max_discount":1,
                "payment":1,
                "shipment":1,
                "total_qty": 1,
                "total_bump": 1,
                "dicount_value": 1,
                "sub_total_price": 1,
                "unique_number": 1,
                "total_price": 1,
                "all_price": 1,
                "create_date": 1,
                "expiry_date": 1,
                "invoice": 1,
                "status":1
        }},
        // {$group: {
        //         _id: "$_id",
        //         user_info:{ $first: "$user_info" },
        //         items: { $push: "$items" },
        //         coupon: { $first: "$coupon" },
        //         shipment: { $first: "$shipment" },
        //         total_qty: { $first: "$total_qty" },
        //         total_price: { $first: "$total_price" },
        //         create_date: { $first: "$create_date" },
        //         expiry_date: { $first: "$expiry_date" },
        //         invoice: { $first: "$invoice" },
        //         status: { $first: "$status" }
        // }},
        // {$addFields: {
        //     "items.status": { $cond: {
        //         if: { $gte: ["$items.whenExpired", new Date()] },
        //         then: "ACTIVE",
        //         else: "EXPIRED"
        //     }}
        // }},
        {$unwind: {
            path: '$items',
            preserveNullAndEmptyArrays: true
        }},
    )
});

OrderSchema.pre('findOne', function() {
    this.populate({
        path: 'user_info',
        select: {_id:1, name:1, phone_number:1, email:1}
    })
    .populate({
    	path: 'coupon',
    	select: {_id:1, name:1, code:1, value:1, max_discount:1, type:1}
    })
    .populate({
    	path: 'payment.method'
    })
    .populate({
        path: 'items.product_info',
        select: {
            _id:1, 
            name:1, 
            type:1, 
            visibility:1, 
            price:1, 
            sale_price:1, 
            ecommerce:1, 
            boe:1,
            bump:1,
            time_period:1,
        },
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

OrderSchema.pre('remove', async (next) => {
    await this.model('Shipment').remove({ "shipment.shipment_info": this._id }).exec();
    await this.model('Tag').updateMany(
        {},
        { $pull: { order: this._id } }
    )
    next();
});

// create index search
OrderSchema.index({
    user_id: 'text', 'items.product_id': 'text', 'items.sub_price': 'text', 
    'coupon.coupon_id': 'text', 'payment.method.id': 'text', 'payment.method.name': 'text',
    'payment.status': 'text', 'payment.external_id': 'text', 'payment.phone_number': 'text', 'payment.payment_code': 'text',
    'shipment.address_id': 'text', 'shipment.shipment_id': 'text',
    total_qty: 'text', total_price: 'text', invoice: 'text',
    create_date : 'text', expiry_date: 'date', status: 'text', "items.utm": 'text'
});
