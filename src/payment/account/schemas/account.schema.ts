import * as mongoose from 'mongoose';

export const PaymentMethodSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    info: String
},{
	collection: 'payment_methods',
	versionKey: false
});

export const PaymentAccountSchema = new mongoose.Schema({
	payment_type: { type: mongoose.Types.ObjectId, ref: 'PaymentMethod' },
	pa_id: String,
	external_id: String,
	payment_id: String,
	payment_code: String,
	retail_outlet_name: String,
	ewallet_type: String,
	user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
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