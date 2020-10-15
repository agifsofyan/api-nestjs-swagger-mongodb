import * as mongoose from 'mongoose';

export const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        variant: String,
        qty: Number,
        note: String
    }],
    total_qty: Number,
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    total_price: Number,
},{
	collection: 'carts',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});