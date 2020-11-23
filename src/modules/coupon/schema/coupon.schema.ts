import * as mongoose from 'mongoose';
import { expiring } from 'src/utils/StringManipulation';

export const CouponSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    code: {
        type: String,
        required: true,
	    unique: true
    },
    value: {
        type: Number,
        required: true,
    },
    start_date: {
        type: Date,
        default: new Date()
    },
    end_date: {
        type: Date,
        required: true,
        default: expiring(14)
    },
    max_discount: {
        type: Number,
        required: true,
    },
    payment_method: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'PaymentMethod',
	default: null
    },
    type: String,
    product_id: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Product',
	default: null
    }
},{ 
	collection: 'coupons',
	versionKey: false, 
	timestamps: { createdAt: false, updatedAt: false }, 
});

// create index search
CouponSchema.index({ name: 'text', code: 'text', value: 'text', payment_method: 'text', type: 'text' });
