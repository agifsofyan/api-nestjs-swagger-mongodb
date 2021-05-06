import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
	    default: null
        //required: true
    },
    slug: {
        type: String,
	    default: null,
	    unique: true
    },
    code: {
        type: String,
        unique: true,
	    default: null
    },
    type: {
        type: String,
        required: true,
        enum: [ "boe", "ecourse", "ecommerce", "bonus" ],
        default: "boe"
    },
    visibility: {
        type: String,
        enum: [ "publish", "private", "draft" ],
	    default: "publish"
    },

    headline: { type: String, default: null },
    subheadline: { type: String, default: null },
    description: { type: String, default: null },

    // feedback: String,
    time_period: { type: Number, default: 1 }, // month

    price: {
        type: Number,
	    default: 0
        //required: true
    },

    sale_price: {
        type: Number,
        default: 0
    },

    sale_method: {
        type: String,
        enum: ['normal', 'upsale', 'upgrade', 'crossale'],
	    default: "normal"
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
	    default: null
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
	    default: null
    },

    //reseller: String, // ref: User (Id & Name)

    image_url: [{ type: String}],
    media: {
        isVideo: Boolean,
        url: String
    },
    
    bonus: {
        image: String,
        title: String,
        description: String,
    },

    section: [{
        title: { type: String },
        content: { type: String },
        image: { type: String }
    }],

    learn_about: [{
        title: { type: String },
        content: { type: String },
        note: { type: String}
    }],

    topic: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],

    agent: [{
        type: mongoose.Schema.Types.ObjectId, //ObjectId,
        ref: 'Admin'
    }],

    boe: {
        date: { type: String },
        duration: { type: String },
    	start_time: { type: String },
    	client_url: { type: String },
        beginTime: {type: Date},
        endTime: {type: Date}
    },

    ecommerce: {
        weight: { type: Number },
        shipping_charges: { type: Boolean },
        stock: { type: Number },
        is_regular: { type: Boolean }
    },

    bump: [{
    	bump_name: { type: String },
    	bump_price: { type: Number },
        bump_weight: { type: Number }, // in gram
        bump_image: { type: String },
        bump_heading: { type: String },
        bump_desc: { type: String },
    }],

    tag: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    
},{
	collection: 'products',
	versionKey: false,
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

ProductSchema.pre('findOne', function() {
    this.populate({
        path: 'created_by',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'updated_by',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'topic',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'agent',
        select: {_id:1, name:1, phone_number:1}
    })
    .populate({
        path: 'tag',
        select: {_id:1, name:1}
    })
});

ProductSchema.pre('remove', async (next) => {
    await this.model('Content').remove({ product: this._id }).exec();
    await this.model('Coupon').remove({ product_id: this._id }).exec();
    await this.model('Tag').updateMany(
        {},
        { $pull: { product: this._id } }
    )
    next();
});

// create index search
ProductSchema.index({
    name: 'text', headline: 'text', description: 'text',
    'bump.bump_name': 'text', 'topic.name': 'text', 'agent.name': 'text'
});
