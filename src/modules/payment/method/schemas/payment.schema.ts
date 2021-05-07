import * as mongoose from 'mongoose';

export const PaymentMethodSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    info: { type: String, default: null },
    vendor: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: null },
    account_name: { type: String },
    account_number: { type: String },
},{
	collection: 'payment_methods',
	versionKey: false
});

PaymentMethodSchema.pre('remove', function(next) {
    this.model('Coupon').remove({ payment_method: this._id }).exec();
    next();
});

// create index search
PaymentMethodSchema.index({
    name: 'text', info: 'text', vendor: 'text'
});
