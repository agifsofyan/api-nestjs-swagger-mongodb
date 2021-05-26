import * as mongoose from 'mongoose';
import { expiring } from 'src/utils/order';

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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethod',
	    default: null
    },
    type: String,
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
	    default: null
    },
    tag: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }]
},{ 
	collection: 'coupons',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: false }, 
});

// create index search
CouponSchema.index({ name: 'text', code: 'text', value: 'text', payment_method: 'text', type: 'text' });

CouponSchema.pre('find', function() {
    this.populate({
        path: 'payment_method',
        select: {_id:1, name:1, info:1, vendor:1, isActive:1}
    })
    .populate({
        path: 'product_id',
        select: {_id:1, name:1, slug:1, code:1, type:1, visibility:1}
    })
    .populate({
        path: 'tag',
        select: {_id:1, name:1}
    })
    .sort({ created_at: -1 })
});

CouponSchema.pre('findOne', function() {
    this.populate({
        path: 'payment_method',
        select: {_id:1, name:1, info:1, vendor:1, isActive:1}
    })
    .populate({
        path: 'product_id',
        select: {_id:1, name:1, slug:1, code:1, type:1, visibility:1}
    })
    .populate({
        path: 'tag',
        select: {_id:1, name:1}
    })
});

/**
CouponSchema.pre('aggregate', async function() {
    await this.pipeline().unshift(
        {
            $lookup: {
                from: 'payment_methods',
                localField: 'payment_method',
                foreignField: '_id',
                as: 'payment_method_info'
            }
        },
            {
                $unwind: {
                path: '$payment_method_info',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'product_id',
                foreignField: '_id',
                as: 'product_info'
            }
        },
            {
                $unwind: {
                path: '$product_info',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'tags',
                localField: 'tag',
                foreignField: '_id',
                as: 'tag'
            }
        },
            {
                $unwind: {
                path: '$tag',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                is_active: { $cond: {
                    if: { $gte: ["$end_date", new Date()] },
                    then: true,
                    else: false
                }}
            }
        },
        {
            $project: {
                name: 1,
                code: 1,
                value: 1,
                start_date: 1,
                end_date: 1,
                max_discount: 1,
                payment_method: 1,
                type: 1,
                product_id: 1,
                "product_info._id":1,
                "product_info.name":1,
                "product_info.slug":1,
                "product_info.type":1,
                "product_info.visibility":1,
                "payment_method_info._id":1,
                "payment_method_info.name":1,
                "payment_method_info.info":1,
                "payment_method_info.vendor":1,
                "payment_method_info.isActive":1,
                tag: 1,
                is_active: 1,
                created_at: 1
            }
        },
        {
           $sort : { created_at: -1 }
        }
    )
});
*/

CouponSchema.pre('remove', async (next) => {
    await this.model('Tag').updateMany(
        {},
        { $pull: { coupon: this._id } }
    )
    next();
});
