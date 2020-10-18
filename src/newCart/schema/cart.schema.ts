import * as mongoose from 'mongoose';

export const CartItemSchema = new mongoose.Schema({
    product_id: String,
    variant: {
        type: String,
        default: null
    },
    quantity: {
        type: Number,
        default: 1
    },
    note: {
        type: String,
        default: null,
    },
    shipment_id: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Shipment'
    },
    whenAdd: {
        type: Date,
        default: Date.now
    },
    whenExpired: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    coupon_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
});

export const CartSchema = new mongoose.Schema({
    user_id: String,
    status: {
        type: String,
        enum: ['active', 'completed', 'expiring', 'expired'],
        default: 'active'
    },
    items: [CartItemSchema],
    modifiedOn: { type: Date }
},{
	collection: 'carts',
	versionKey: false
});

// CartSchema.static({
//     summary: function(params, cb) {
//         this.aggregate([
//             {
//                 $match: { user_id: params.user_id }
//             },
//             {
//                 $unwind: {
//                     path: '$items'
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'products',
//                     localField: 'items.product',
//                     foreignField: '_id',
//                     as: 'product'
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$product',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $group: {
//                     _id: { user_id: 'user_id' },
//                     count: { $sum: '$items.quantity' },
//                     total: { $sum: { $multiply: ['$product.price', '$items.quantity'] } }
//                 }
//             }
//         ], (err, results) => cb(err, results[0]));
//     },
//     addProduct: function(params, cb, test) {
//         var d = new Date();

//         if (test) {
//             d.setMinutes(d.getMinutes() - 10);
//         }

//         this.findOneAndUpdate(
//             { user_id: params.user_id },
//             { $set: { modifiedOn: d } },
//             { upsert: true, new: true }, (err, cart) => {
//                 if (err) {
//                     return cb(err);
//                 }

//                 const index = cart.items.findIndex((item) => {
//                     return item.product.equals(params.productId);
//                 });

//                 if (index === -1) {
//                     cart.items.push({
//                         product: params.productId,
//                         quantity: params.quantity
//                     });
//                 } else {
//                     cart.items[index].quantity += parseFloat(params.quantity);
//                 }
//                 cart.save(cb);
//             });
//     },
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

// CartSchema.virtual('UserDoc', {
//    ref: 'User',
//    localField: 'user',
//    foreignField: '_id',
//    justOne: true
// })

// CartSchema.virtual('ProductDoc', {
//     ref: 'Product',
//     localField: 'items.product',
//     foreignField: '_id',
//     justOne: true, // default is false
// });
