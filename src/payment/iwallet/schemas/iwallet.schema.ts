import * as mongoose from 'mongoose';

export const IWalletSchema = new mongoose.Schema({
    
},{
    collection: 'iwallets',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})