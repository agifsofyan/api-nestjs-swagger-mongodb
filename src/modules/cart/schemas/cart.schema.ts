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

CartSchema.pre('findOne', function() {
    this.populate({
        path: 'user',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'items.product',
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
    .populate({ 
        path: 'shipment.shipment',
        select: {
            _id:1, 
            to:1, 
            "parcel_job.dimension":1,
            "parcel_job.pickup_service_level":1,
            "parcel_job.pickup_date":1,
            "parcel_job.delivery_start_date":1,
            service_type:1,
            service_level:1,
            requested_tracking_number:1
        }
    })
});
