import * as mongoose from 'mongoose';

export const TemplateSchema = new mongoose.Schema({
    template: {
        type: String,
        default: null
    },
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
    },
    versions: [{
        engine: {
            type: String,
            default: 'handlebars'
        },
        tag: {
            type: String,
            default: "initial"
        },
        comment: {
            type: String,
            default: null
        },
        active: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: new Date()
        }
    }]
},{ 
	collection: 'templates',
	versionKey: false, 
	timestamps: { createdAt: true, updatedAt: true }, 
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
