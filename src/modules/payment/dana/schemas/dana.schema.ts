import * as mongoose from 'mongoose';

export const DanaSchema = new mongoose.Schema({
    merchant_trans_id: String,
    acquirement_id: String,
    invoice_number: String,
    checkout_url: String,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    total_price: Number
},{
    collection: 'dana-orders',
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: false },
});
