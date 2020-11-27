import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

export const FollowUpSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    template: { type: String, default: null },
    type: { type: String, default: null },
    by: {
	    type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
	    default: null
    }
},{ 
	collection: 'followups',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
});

// create index search
FollowUpSchema.index({
    name: 'text', template: 'text', type: 'text', by: 'text'
});
