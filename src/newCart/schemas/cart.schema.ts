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
    // variant: {
    //     type: String,
    //     default: null
    // },
    quantity: {
        type: Number,
        default: 1
    },
    // sub_price: Number,
    // note: {
    //     type: String,
    //     default: null,
    // },
    // shipment_id: {
    //     type: mongoose.Schema.Types.Mixed,
    //     ref: 'Shipment'
    // },
    isActive: {
        type: Boolean,
        default: true
    },
    // coupon_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Coupon'
    // },
    whenAdd: {
        type: Date,
        default: Date.now
    },
    whenExpired: {
        type: Date,
        default: expDate
    },
    // whenOrder: {
    //     type: Date,
    //     default: null
    // },
    // order_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Order'
    // },
    // isCheckout: {
    //     type: Boolean,
    //     default: false
    // }
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
//     updateQuantity: function(params, cb) {
//         this.findOneAndUpdate(
//             { user_id: params.user_id },
//             {},
//             { upsert: true, new: true }, (err, cart) => {
//                 if (err) {
//                     return cb(err);
//                 }

//                 const index = cart.items.findIndex((item) => {
//                     return item.product.equals(params.productId);
//                 });

//                 if (index === -1) {
//                     return cb(new Error('Can not find product in cart'));
//                 }
//                 cart.items[index].quantity = params.quantity;

//                 cart.save(cb);
//             });
//     },
//     findItem: function(params, cb) {
//         this.findOne({ user_id: params.user_id }).exec((err, cart) => {
//             if (err) {
//                 return cb(err);
//             }

//             const index = cart.items.findIndex((item) => {
//                 return item.product.equals(params.productId);
//             });

//             if (index === -1) {
//                 return cb(new Error('Can not find product in cart'));
//             }

//             cb(null, cart.items[index]);
//         });
//     },
//     removeProduct: function(params, cb) {
//         this.update(
//             { user_id: params.user_id },
//             {
//                 $pull: { items: { product: params.productId } },
//                 $set: { modifiedOn: new Date() }
//             },
//             cb
//         );
//     },
//     getExpiredCarts: function(params, cb) {
//         var now = new Date();

//         if (typeof params.timeout !== 'number') {
//             return cb(new Error('timeout should be a number!'));
//         }

//         now.setMinutes(now.getMinutes() - params.timeout);

//         this.find(
//             { modifiedOn: { $lte: now }, status: 'active' }
//         ).exec(cb);
//     }
// });

// mongoose.model('Cart', CartSchema);

// CartSchema.virtual('users', {
//    ref: 'User',
//    localField: 'user_id',
//    foreignField: '_id',
//    justOne: true
// })

// CartItemSchema.virtual('products', {
//     ref: 'Product',
//     localField: 'product_id',
//     foreignField: '_id',
//     justOne: true, // default is false
// });
