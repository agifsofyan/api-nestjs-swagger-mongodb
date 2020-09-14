import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';

export const ProductSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    type: {
	    type: String, 
        required: true,
        enum: ["webinar", "digital", "ecommerce", "bonus"],
        default: "webinar"
    },
    name: { type: String },
    slug: { type: String, slug: "name" },
    visibility: {
        type: String,
        enum: ["publish", "private"],
	    default: "publish"
    },
    topic: [{
        type: mongoose.Types.ObjectId,
        ref: 'Topic'
    }],
    form_type: {
        type: String, 
        enum: ["simple", "full"],
        default: "simple"
    },
    image_url: [], // Array
    video_url: { type: String },
    short_desc: { type: String },
    description: { type: String },
    time_period: { type: String },
    price: { type: String, required: true },
    created_by: { type: String },
    updated_by: { type: String },
    start_at: {
        type: Date,
        default: Date.now
    },
    end_at: {
        type: Date,
        default: Date.now
    },
    media_url: { type: String },
    sale_method: {
        type: String,
        enum: ["normal", "upsale", "upgrade", "crossale"],
	    default: "normal"
    },
    product_redirect: [] // Array
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

mongoose.plugin(slug);