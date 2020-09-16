import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';

export const TopicSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    slug: { type: String, slug: 'name' }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

mongoose.plugin(slug);