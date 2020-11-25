import * as mongoose from 'mongoose';
import { expiring } from 'src/utils/order';

export const OrderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        variant: {
            type: String,
            default: null
        },
        note: {
            type: String,
            default: null,
        },
        is_bump: {
            type: Boolean,
            default: false
        },
        quantity: {
            type: Number,
            default: 1
        },
        bump_price: {
            type: Number,
            default: 0
        },
        sub_price: {
            type: Number,
            default: 0
        }
    }],

    coupon: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Coupon',
        name: String,
        code: String,
        value: Number,
        max_discount: Number
    },

    payment: {
        method: { 
	        type: mongoose.Schema.Types.Mixed, 
	        ref: 'PaymentMethod',
            name: String,
            info: String
        },
        status: String,
        pay_uid: String,
        external_id: String,
        payment_id: String,
        payment_code: String,
        callback_id: String,
	    phone_number: String
    },

    shipment: {
        address_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        shipment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shipment',
            default: null
        }
    },

    total_qty: Number,
    total_price: Number,
    invoice: String,

    create_date: {
        type: Date,
        default: new Date()
    },

    expiry_date: {
        type: Date,
        default: expiring(2)
    },

    status: {
        type: String,
        enum: [ "PAID", "UNPAID", "PENDING", "EXPIRED"],
        default: "PENDING"
    }
},{
    collection: 'orders',
    versionKey: false
}); 

OrderSchema.pre('find', function() {
    this.populate({
	path: 'user_id',
	select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'items.product_id',
	alias: 'product_info',
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
	path: 'shipment.shipment_id',
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
    .exec(function(err, person){
                    if(err) return done(err);
                    // Every model has toAliasedFieldsObject
                    assert.isFunction(person.toAliasedFieldsObject);
                    assert.isFunction(person.child.toAliasedFieldsObject);

                    // Parent and child properties are aliased
                    assert.equal(person.name, 'Mike');
                    assert.equal(person.child.name, 'Tim');

                    // You can call toAliasedFieldsObject on the children
                    var t = this.found_parent.child.toAliasedFieldsObject();
                    assert.equal(t.name, 'Tim');
});

/**
TopicSchema.pre('remove', function(next) {
    this.model('Product').remove({ topic: this._id }).exec();
    this.model('Content').remove({ topic: this._id }).exec();
    next();
});
*/

// create index search
OrderSchema.index({
    user_id: 'text', 'items.product_id': 'text', 'items.sub_price': 'text', 
    'coupon.coupon_id': 'text', 'payment.method.id': 'text', 'payment.method.name': 'text',
    'payment.status': 'text', 'payment.external_id': 'text', 'payment.phone_number': 'text', 'payment.payment_code': 'text',
    'shipment.address_id': 'text', 'shipment.shipment_id': 'text',
    total_qty: 'text', total_price: 'text', invoice: 'text',
    create_date : 'text', expiry_date: 'date', status: 'text'
});
