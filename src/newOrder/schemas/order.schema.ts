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
        shipment_id: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'Shipment'
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

    coupon_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    payment: {
        method: { type: mongoose.Types.ObjectId, ref: 'PaymentMethod' },
        phone_number: String,
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentAccount'
        },
        status: String,
        pay_uid: String,
        external_id: String,
        payment_id: String,
        payment_code: String,
        callback_id: String
    },
    total_qty: Number,
    total_price: Number,
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    create_date: {
        type: Date,
        default: new Date()
    },
    expiry_date: {
        type: Date,
        default: expiring(31)
    }
},{
    collection: 'orders',
    versionKey: false
});

// create index search
// OrderSchema.index({
//     status: 'text', merchant_name: 'text', amount: 'text', 
//     payer_email: 'text', description: 'text', 'user.name': 'text', 
//     'user.email': 'text', 'address.address_label': 'text',
//     'address.receiver_name': 'text', 'address.phone_number': 'text',
//     'address.address': 'text'
// });