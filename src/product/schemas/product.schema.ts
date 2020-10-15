import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    slug: {
        type: String,
	    unique: true
    },
    code: {
        type: String,
        unique: true
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

    image_url: String,
    video_url: String,

    headline: String,
    subheadline: String,
    description: String,
    time_period: Number,

    price: {
        type: Number,
        required: true
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
        ref: 'User',
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    image_bonus_url: [{
	    type: String
    }],   
    image_text_url: [{
	    type: String
    }],
    image_product_url: [{
	    type: String
    }],
    
    section: [{
        title: String,
        content: String
    }],

    learn_about: [{
        title: String,
        content: String
    }],

    topic: [{
        type: mongoose.Schema.Types.Mixed,
        ref: 'Topic',
        id: String,
        name: String,
    }],

    agent: [{
        type: mongoose.Schema.Types.Mixed, //ObjectId,
        ref: 'User',
        id: String,
        name: String
    }],

    // on_sale: {
    //     type: Boolean,
    //     default: false
    // },

    webinar: {
        date: String,
        duration: String,
    	start_time: String,
    	client_url: String,
    },

    ecommerce: {
        weight: Number,
        shipping_charges: Boolean,
        stock: Number
    },
    
    feature: {
    	feature_onheader: {
            type: String
        },
    	feature_onpage: {
            type: String
        },
    },

    bump: [{
    	bump_name: {
            type: String
        },
    	bump_price: {
            type: Number
        },
        bump_weight: {
            type: Number
        },
        bump_image: {
            type: String
        }
    }],
},{ 
	collection: 'products',
	versionKey: false, 
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
});