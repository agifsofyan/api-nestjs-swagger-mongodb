import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const AdminSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    password: {type: String, required: true },
    role: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }],
}, { 
    collection: 'administrators',
    versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// create index search
AdminSchema.index({
    name: 'text', email: 'text', phone_number: 'text'
});

AdminSchema.pre('save', async function(next: mongoose.HookNextFunction) {
    try {
        if (!this.isModified('password')) {
            return next();
        }

        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(this['password'], salt);
        this['password'] = hashed;

        return next();
    } catch (err) {
        return next(err);
    }
});

AdminSchema.pre('remove', function(next) {
    this.model('FollowUp').remove({ by: this._id }).exec();
    this.model('Product').remove({ created_by: this._id, updated_by: this._id, agent: this._id })
    next();
});
