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
        variant: {
	   type: String,
	   default: null
	},
        qty: {
	   type: Number,
	   default: 1
	},
        note: {
	  type: String,
	  default: null,
	},
        shipment: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'Shipment',
	    default: ''
        },
	whenAdd: {
	  type: Date,
	  default: Date.now
	},
	whenExpired: Date,
        isActive: {
	  type: Boolean,
	  default: true
	}
    }],
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    total_qty: Number,
    total_price: Number,
    create_date: {
	type: Date,
	default: Date.now
    },
    expiry_date: Date,
    status: String,
},{
	collection: 'carts',
	versionKey: false
});
