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
        enum: [ "webinar", "digital", "ecommerce", "bonus" ],
        default: "webinar"
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
    time_period: { type: Number, default: 0 },

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
        type: mongoose.Schema.Types.Mixed,
        ref: 'Admin',
	default: null
    },
    updated_by: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Admin',
	default: null
    },

    //reseller: String, // ref: User (Id & Name)

    image_url: [{ type: String}],
    image_bonus_url: { type: String },
    media_url: { type: String },

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
        type: mongoose.Schema.Types.Mixed,
        ref: 'Topic',
        //id: String,
        //name: String,
        //icon: String
    }],

    agent: [{
        type: mongoose.Schema.Types.Mixed, //ObjectId,
        ref: 'Admin',
        //id: String,
        //name: String
    }],

    webinar: {
        date: { type: String },
        duration: { type: String },
    	start_time: { type: String },
    	client_url: { type: String },
    },

    ecommerce: {  
        weight: { type: Number },
        shipping_charges: { type: Boolean },
        stock: { type: Number }
    },

    feature: {
    	feature_onheader: {
            type: String
        },
    	feature_onpage: {
            type: String
        }
    },

    bump: [{
    	bump_name: { type: String },
    	bump_price: { type: Number },
        bump_weight: { type: Number },
        bump_image: { type: String },
        bump_heading: { type: String },
        bump_desc: { type: String },
    }],
},{
	collection: 'products',
	versionKey: false,
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

ProductSchema.pre('remove', function(next) {
    this.model('Content').remove({ product: this._id }).exec();
    this.model('Coupon').remove({ product_id: this._id }).exec();
    next();
});


// create index search
ProductSchema.index({
    name: 'text', headline: 'text', description: 'text',
    feedback: 'text', section: 'text', 'feature.feature_onheader': 'text',
    'feature.feature_onpage': 'text', 'bump.bump_name': 'text',
    'topic.name': 'text', 'agent.name': 'text'
});

// create populate (join)
//ProductSchema.virtual('TopicDocument', {
//    ref: 'Topic',
//    localField: 'topic',
//    foreignField: '_id',
//    justOne: false, // default is false
//    default: 'false'
//});

//ProductSchema.virtual('AgentDocument', {
//    ref: 'Agent',
//    localField: 'agent',
//    foreignField: '_id',
//    justOne: false, // default is false
//    default: 'false'
//});
