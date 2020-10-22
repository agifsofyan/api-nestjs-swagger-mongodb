import * as mongoose from 'mongoose';

// Virtual Account
export const VASchema = new mongoose.Schema({
    ip: String,
    currency: String,
    bank_code: {
        type: String,
        enum: [ 'MANDIRI', 'BNI', 'BRI', 'PERMATA', 'BCA']
    },
    merchant_code: String,
    name: String,
    account_number: String,
    is_single_use: String,
    expiration_date: Date,
    external_id: String,
    owner_id: String,
    user_id: String,
    va_id: String
},{
    collection: 'virtual_accounts',
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
})