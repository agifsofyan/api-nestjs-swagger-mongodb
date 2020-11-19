import * as mongoose from 'mongoose';
import { expiring } from '../../utils/order';

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
        default: expiring(31)
    },

    status: {
        type: String,
        enum: [ "PAID", "UNPAID", "PENDING", "EXPIRED"],
        default: "UNPAID"
    }
},{
    collection: 'orders',
    versionKey: false
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
