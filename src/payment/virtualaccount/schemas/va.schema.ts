import * as mongoose from 'mongoose';

// Virtual Account
export const VASchema = new mongoose.Schema({
    id: String,
    owner_id: String,
    external_id: String,
    bank_code: {
        type: String,
        enum: [ 'MANDIRI', 'BNI', 'BRI', 'PERMATA', 'BCA']
    },
    name: String,
    account_number: Number,
    merchant_code: String
},{
    collection: 'virtual_accounts',
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
})