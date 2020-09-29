import * as mongoose from 'mongoose';

export const OrderSchema = new mongoose.Schema({
    orderId: { type: String },
    invoiceId: { type: String },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    status: { type: String },
    currency: { type: String },
    amount: { type: Number },
    payer_email: { type: String },
    description: { type: String },
    cart: {},
    address: [],
    invoice_url: { type: String },
    expiry_date: { type: Date },
    created_at: { type: Date },
    updated_at: { type: Date }
});