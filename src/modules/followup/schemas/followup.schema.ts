import * as mongoose from 'mongoose';

export const FollowUpSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    activity: [{
        message: String,
        agent : { type: mongoose.Schema.Types.ObjectId, ref: 'Administrators' },
        date: { type: Date, default: new Date() },
        next: { type: Boolean, default: false },
        is_done: { type: Boolean, default: true },
    }],
    is_complete: { type: Boolean, default: false }
},{ 
	collection: 'followups',
	versionKey: false
});

// create index search
FollowUpSchema.index({
    name: 'text', template: 'text', type: 'text', by: 'text'
});

/**
FollowUpSchema.pre('aggregate', function() {
    this.pipeline().unshift(
        {$lookup: {
            from: 'user_profiles',
            localField: 'user',
            foreignField: 'user',
            as: 'profile'
        }},
        {$unwind: {
            path: '$profile',
            preserveNullAndEmptyArrays: true
        }},
        {$lookup: {
            from: 'administrators',
            localField: 'agent',
            foreignField: '_id',
            as: 'agent'
        }},
        {$unwind: {
            path: '$agent',
            preserveNullAndEmptyArrays: true
        }},
        {$lookup: {
            from: 'orders',
            localField: 'order',
            foreignField: '_id',
            as: 'order'
        }},
        {$unwind: {
            path: '$order',
            preserveNullAndEmptyArrays: true
        }},
        {$lookup: {
            from: 'user_profiles',
            localField: 'address',
            foreignField: 'user_profiles.address._id',
            as: 'address'
        }},
        {$group: {
            _id: '$_id',
            user: { $first: {
                _id: '$profile.user._id',
                name: '$profile.user.name',
                email: '$profile.user.email',
                phone_number: '$profile.phone_number',
            }},
            agent: { $first: {
                _id: '$agent._id',
                name: '$agent.name',
                email: '$agent.email'
            }},
            order: { $first: {
                _id: '$order._id',
                invoice: '$order.invoice',
                total_price: '$order.total_price',
                unique_number: '$order.unique_number',
                payment: '$order.payment',
            }},
            address: '$address',
            activity: '$activity',
            is_complete: '$is_complete',
        }}
    )
});
*/
