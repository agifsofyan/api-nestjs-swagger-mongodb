import * as mongoose from 'mongoose';

export const RoleSchema = new mongoose.Schema({
    adminType: {
        type: String, 
        required: true,
        unique: true,
	   // enum: ['SALES', 'ADMIN', 'CONTENT', 'FINANCE', 'MENTOR', 'IT', 'SUPERADMIN'],
	    //default: "ADMIN"
    },
    readWrite: {
        type: Boolean,
	    default: false
    }
},{ 
	collection: 'roles',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: false },
});

RoleSchema.pre('remove', function(next) {
    this.model('User').remove({ role: this._id }).exec();
    next();
});


// create index search
RoleSchema.index({
    adminType: 'text', readWrite: 'text'
});
