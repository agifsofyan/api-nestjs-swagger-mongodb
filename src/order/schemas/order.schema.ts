import * as mongoose from 'mongoose';

const unixTime = Math.floor(Date.now() / 1000);
const duration = (31 * 3600 * 24)
const expired =  unixTime + duration
const expDate = new Date(expired * 1000)

export const OrderSchema = new mongoose.Schema({
//     order_id: { type: String },
//     invoice_id: { type: String },
//     user: {
//         type: mongoose.Types.ObjectId,
//         ref: 'User'
//     },
//     status: { type: String },
//     merchant_name: { type: String },
//     merchant_profile_picture_url: { type: String },
//     currency: { type: String },
//     amount: { type: Number },
//     payer_email: { type: String },
//     description: { type: String },
//     invoice_url: { type: String },
//     // expiry_date: { type: Date },
//     cart: {},
//     address: [],
//     created_at: { type: Date },
//     updated_at: { type: Date } 
// });

    // cart: [String],

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
    payment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
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
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired'],
        default: 'pending'
    },
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