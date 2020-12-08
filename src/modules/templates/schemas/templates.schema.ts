import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

export const TemplateSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
	    unique: true
    },
    description: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String,
        enum: [ "WA", "MAIL" ], 
        default: 'WA' 
    },
    by: {
	    type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
	    default: null
    }
},{ 
	collection: 'templates',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
});

// create index search
TemplateSchema.index({
    name: 'text', description: 'text', type: 'text', by: 'text'
});

TemplateSchema.pre('find', function() {
    this.populate({
        path: 'by',
        select: {_id:1, name:1, email:1}
    })
    .sort({ created_at: -1 })
});

TemplateSchema.pre('findOne', function() {
    this.populate({
        path: 'by',
        select: {_id:1, name:1, email:1}
    })
    .sort({ created_at: -1 })
});
