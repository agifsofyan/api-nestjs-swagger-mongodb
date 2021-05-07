import * as mongoose from 'mongoose';

export const BankTransferSchema = new mongoose.Schema({
    transfer_date: {type: Date},
    // transfer_date: {type: String},
    bank_name: String,
    account_owner_name: String,
    account_number: String,
    destination_bank: {
        type: String,
        default: 'BCA'
    }, //enum [BCA | BNI]
    destination_account: {
        type: String,
        default: 'Laruno'
    },
    destination_number: String,
    invoice_number: String,
    struct_url: String,
    is_confirmed: {
        type: Boolean,
        default: false
    }
},{ 
	collection: 'banktransfers',
	versionKey: false,
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
