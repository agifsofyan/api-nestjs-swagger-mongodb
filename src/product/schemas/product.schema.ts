import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    type: {
	    type: String, 
        required: true,
        enum: ['webinar', 'digital', 'ecommerce', 'bonus'],
        default: 'webinar'
    },
    name: { type: String },
    slug: { type: String },
    visibility: {
        type: String,
        enum: ['publish', 'private', 'draft'],
	    default: 'publish'
    },
    topic: [{
        type: mongoose.Types.ObjectId,
        ref: 'Topic'
    }],
    image_url: { type: String },
    video_url: { type: String },
    headline: { type: String },
    description: { type: String },
    feedback: { type: String },
    time_period: { type: String },
    price: { type: Number, required: true },
    on_sale: { type: Boolean },
    sale_price: { type: Number },
    // created_by: { type: String },
    // updated_by: { type: String },
    webinar: {
        date: { type: Date },
        start_time: { type: String },
        end_time: { type: String },
        client_url: { type: String }
    },
    feature: {
    	feature_onheader: { type: String },
    	feature_onpage: { type: String }
    },
    sale_method: {
        type: String,
        enum: ['normal', 'upsale', 'upgrade', 'crossale'],
	    default: 'normal'
    },
    product_redirect: { 
        type: String,
        ref: 'Product',
        index: true
    },
    agent: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    image_bonus_url: [{ type: String }],
    image_text_url: [{ type: String }],
    image_product_url: [{ type: String }],
    section: { type: String },

    bump: [{
    	bump_name: {
            type: String,
            default: null
        },
    	bump_price: {
            type: String,
            default: null
        },
        bump_weight: {
            type: String,
            default: null
        },
        bump_image: {
            type: String,
            default: null
        }
    }],

    rating: [{
        id_user: {
            type: String,
            default: null
        },
        value: {
            stype: Number,
            default: 0
        }
    }]

}, {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});