import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

export const TopicSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    slug: {
        type: String,
        unique: true,
	    slug: "name"
    },
    icon: String,
    rating: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating',
    }
},{ 
	collection: 'topics',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
});

TopicSchema.pre('remove', function(next) {
    this.model('Product').remove({ topic: this._id }).exec();
    this.model('Content').remove({ topic: this._id }).exec();
    next();
});

// create index search
TopicSchema.index({
    name: 'text', slug: 'text', icon: 'text'
});
