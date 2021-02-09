import * as mongoose from 'mongoose';

export const UserContainSchema = new mongoose.Schema({
    topic: String,
    email: String,
    name: String,
    phone_number: String
},{
	collection: 'user_contain',
	versionKey: false,
	timestamps: { createdAt: 'created_at', updatedAt: false }
})

// create index search
UserContainSchema.index({
    topic: 'text', email: 'text', name: 'text', phone_number: 'text'
});