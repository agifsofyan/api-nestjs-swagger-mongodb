import * as mongoose from 'mongoose';

export const TokenSchema = new mongoose.Schema({
    name: String,
    token: String,
    created_date: { type: Date, default: new Date() },
    expired_date: { type: Date },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
	    default: null
    },
},{
    collection: 'tokens',
    versionKey: false
});
