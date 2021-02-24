import * as mongoose from 'mongoose';

const AnswerModule = new mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId },
    answer: String
});

const MissionSchema = new mongoose.Schema({
    misson_id: { type: mongoose.Schema.Types.ObjectId },
    done: {type: Boolean, default: false }
});

export const UserProductScema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'User',
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'Product',
    },
    product_type: String,
	content_id: {
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'Content',
    },
	content_type: String,
	content_kind: String,
    topic: [{
        type: mongoose.Schema.Types.ObjectId,
	    ref: 'Topic',
    }],
    progress: {
        type: Number,
        default: 0
    }, // in percent
    order_invoice: String,
    expired_date: {type: Date, default: null},
    utm: {type: String, default: null},
    modules: {
        answers: [AnswerModule],
        mission_complete: [MissionSchema],
    }
},{
	collection: 'user_products',
	versionKey: false
});

UserProductScema.index({
    type: 'text', progress: 'text', utm: 'text'
});

// UserProductScema.pre('aggregate', function (){
//     this.pipeline().unshift(
//         {$lookup: {
//                 from: 'users',
//                 localField: 'user',
//                 foreignField: '_id',
//                 as: 'user'
//         }},
//         {$unwind: {
//                 path: '$user',
//                 preserveNullAndEmptyArrays: true
//         }},
//         {$lookup: {
//                 from: 'products',
//                 localField: 'product',
//                 foreignField: '_id',
//                 as: 'product'
//         }},
//         {$unwind: {
//                 path: '$product',
//                 preserveNullAndEmptyArrays: true
//         }},
//         {$lookup: {
//                 from: 'contents',
//                 localField: 'content_id',
//                 foreignField: '_id',
//                 as: 'content'
//         }},
//         {$unwind: {
//                 path: '$content',
//                 preserveNullAndEmptyArrays: true
//         }},
//         {$lookup: {
//                 from: 'topics',
//                 localField: 'topic',
//                 foreignField: '_id',
//                 as: 'topic'
//         }},
//         {$lookup: {
//                 from: 'orders',
//                 localField: 'order_invoice',
//                 foreignField: 'invoice',
//                 as: 'order'
//         }},
//         {$unwind: {
//             path: '$order',
//             preserveNullAndEmptyArrays: true
//         }},
//         {$project: {
//             "user._id":1,
//             "user.name":1,
//             "user.email":1,
//             "user.phone_number":1,
//             "product._id":1,
//             "product.name":1,
//             "product.slug":1,
//             "product.code":1,
//             "product.type":1,
//             "product.visibility":1,
//             "product.time_period":1,
//             "utm":1,
//             "content.title":1,
//             "content.desc":1,
//             "content.images":1,
//             "content.podcast":1,
//             "content.video":1,
//             "content.thanks":1,
//             "content.placement":1,
//             "content.post_type":1,
//             "content.series":1,
//             "content.module":1,
//             "topic":1,
//             "order.invoice":1,
//             "order.payment":1,
//             "progress": 1,
//             "expired_date": 1,
//             "create_date": 1,
//             "expiry_date": 1
//         }},
//         // { $addFields: {
//         //     "content.type": { 
//         //         $cond: {
//         //             if: { 
//         //                 "$content.isBlog": false
//         //             },
//         //             then: "fulfilment",
//         //             else: "blog"
//         //         }
//         //     },
//         // }}
//     )
// });