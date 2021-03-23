import * as mongoose from 'mongoose';

export const UTMSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        unique: true,
    },
    
    status: String
},{ 
	collection: 'utm',
	versionKey: false,
});

export const UtmModel = mongoose.model('UTM', UTMSchema)