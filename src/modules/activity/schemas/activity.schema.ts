import * as mongoose from 'mongoose';

export const ActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
	collection: 'activities',
	versionKey: false
});
