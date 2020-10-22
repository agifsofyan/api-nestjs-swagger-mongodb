import * as mongoose from 'mongoose';

const unixTime = Math.floor(Date.now() / 1000);
const duration = (31 * 3600 * 24)
const expired =  unixTime + duration
const expDate = new Date(expired * 1000)

export const PaymentMethodSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    info: String
},{
	collection: 'paymentmethods',
	versionKey: false
});

export const PaymentSchema = new mongoose.Schema({
    
},{
	collection: 'payments',
	versionKey: false
});