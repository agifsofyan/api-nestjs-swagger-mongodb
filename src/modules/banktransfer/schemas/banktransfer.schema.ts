import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const BankTransferSchema = new mongoose.Schema({
    transfer_date: Date,
    bank_name: String,
    account_owner_name: String,
    account_number: String,
    destination_bank: {
	type: String,
	default: 'BCA'
    }, //enum [BCA | BNI]
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
