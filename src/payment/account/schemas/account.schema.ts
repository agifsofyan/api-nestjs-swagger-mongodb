import * as mongoose from 'mongoose';

export const PaymentAccountSchema = new mongoose.Schema({
	payment_type: { type: mongoose.Types.ObjectId, ref: 'PaymentMethod' },
	pa_id: String,
	external_id: String,
	payment_id: String,
	payment_code: String,
	retail_outlet_name: String,
	user_id: String,
	expected_amount: Number,
	bank_code: {
        type: String,
        enum: [ 'MANDIRI', 'BNI', 'BRI', 'PERMATA', 'BCA']
	},
	phone_number: String,
	account_name: String,
	account_number: String,
	account_email: String,
	card_cvn: String,
	expiry: Date,
},{
	collection: 'payment_accounts',
	versionKey: false
});