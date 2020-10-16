import * as mongoose from 'mongoose';

export const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'Product'
        },
        variant: String,
        qty: Number,
        note: String,
        shipment: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'Shipment'
        },
        isActive: Boolean
    }],
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    total_qty: Number,
    total_price: Number,
    expiry_date: Date,
    status: String,
},{
	collection: 'carts',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});