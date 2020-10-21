import * as mongoose from 'mongoose';

export const CreditCartSchema = new mongoose.Schema({
    amount: Number,
    card_number: Number,
    card_exp_month: Number,
    card_exp_year: Number,      
    card_cvn: Number,
    is_multiple_use: Boolean,
    should_authenticate: Boolean
},{
    collection: 'credit_cards',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})