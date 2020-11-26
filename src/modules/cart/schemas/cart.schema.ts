import * as mongoose from 'mongoose';
import { expiring } from 'src/utils/order';

export const CartItemSchema = new mongoose.Schema({
    product_info: {
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
    user_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [CartItemSchema],
    modifiedOn: { type: Date }
},{
	collection: 'carts',
	versionKey: false
});

CartSchema.pre('findOne', function() {
    this.populate({
        path: 'user_info',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'items.produc_info',
        select: ({
            _id:1, 
            name:1, 
            type:1, 
            visibility:1, 
            price:1, 
            sale_price:1, 
            ecommerce:1, 
            webinar:1,
            bump:1
        }),
        product_info: 1,
        populate: [
            { path: 'topic', select: {_id:1, name:1, slug:1, icon:1} },
            { path: 'agent', select: {_id:1, name:1} }
        ]
    })
});
