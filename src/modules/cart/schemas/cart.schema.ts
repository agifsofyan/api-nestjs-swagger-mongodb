import * as mongoose from 'mongoose';
import { expiring } from 'src/utils/order';

export const CartItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    whenAdd: {
        type: Date,
        default: Date.now
    },
    whenExpired: {
        type: Date,
        default: expiring(31)
    }
});

export const CartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [CartItemSchema],
    modifiedOn: { type: Date }
},{
	collection: 'carts',
	versionKey: false
});
