import * as mongoose from 'mongoose';

const unixTime = Math.floor(Date.now() / 1000);
const duration = (31 * 3600 * 24)
const expired =  unixTime + duration
const expDate = new Date(expired * 1000)

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
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentAccount'
        },
        external_id: String,
        payment_id: String,
        callback_id: String
    },
    total_qty: Number,
    total_price: Number,
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    expiry_date: {
        type: Date,
        default: expDate
    },
    // status: {
    //     type: String,
    //     enum: ['pending', 'completed', 'expired'],
    //     default: 'pending'
    // },
},{
    collection: 'orders',
    versionKey: false, 
    timestamps: { createdAt: 'create_date', updatedAt: 'update_date' }
});

// create index search
// OrderSchema.index({
//     status: 'text', merchant_name: 'text', amount: 'text', 
//     payer_email: 'text', description: 'text', 'user.name': 'text', 
//     'user.email': 'text', 'address.address_label': 'text',
//     'address.receiver_name': 'text', 'address.phone_number': 'text',
//     'address.address': 'text'
// });