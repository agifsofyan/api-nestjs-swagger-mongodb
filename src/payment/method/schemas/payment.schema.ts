import * as mongoose from 'mongoose';

export const PaymentMethodSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    info: String
},{
	collection: 'payment_methods',
	versionKey: false
});