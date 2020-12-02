import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

export const HashTagSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    used: {
        type: Number,
	    default: 1
    }
},{ 
	collection: 'hashtags',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: false }, 
});

HashTagSchema.pre('remove', function(next) {
    this.model('Product').remove({ hashtag: this._id }).exec();
    this.model('Content').remove({ hashtag: this._id }).exec();
    this.model('Coupon').remove({ hashtag: this._id }).exec();
    next();
});

// create index search
HashTagSchema.index({
    name: 'text', slug: 'text', icon: 'text'
});
