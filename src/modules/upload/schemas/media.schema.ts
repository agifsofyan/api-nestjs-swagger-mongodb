import * as mongoose from 'mongoose';

export const MediaSchema = new mongoose.Schema({
    filename: String,
    path: String,
    url: String,
    filetype: String,
    mimetype: String,
    sub_path: String,
    created_at: { type: Date, default: new Date() }
},{ 
	collection: 'media',
	versionKey: false 
});

// create index search
MediaSchema.index({
    filename: 'text', path: 'text', url: 'text', filetype: 'text', mimetype: 'text'
});
