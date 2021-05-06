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
    utm: {
        type: String,
        default: 'origin'
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
	    phone_number: String,
        invoice_url: String,
    },

    shipment: {
        address_id: {
            type: mongoose.Schema.Types.ObjectId
        },
        price: {
            type: Number
        },
        shipment_info: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shipment',
            alias: "shipment_id",
        }
    },

    total_bump: Number,
    discount_value: Number,
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

OrderSchema.pre('findOne', function() {
    this.populate({
        path: 'user_info',
        select: {_id:1, name:1, email:1}
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
            service_type:1,
            service_level:1,
            requested_tracking_number:1,
            from:1,
            to:1, 
            "parcel_job.pickup_date":1,
            "parcel_job.delivery_start_date":1,
            "parcel_job.dimensions":1,
            "parcel_job.pickup_service_level":1,
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
