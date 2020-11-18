import * as mongoose from 'mongoose';

const unixTime = Math.floor(Date.now() / 1000);
const duration = (31 * 3600 * 24)
const expired =  unixTime + duration
const expDate = new Date(expired * 1000)

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
        default: expDate
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
