import * as mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
    title: { type: String, default: 'Home' },
    country: { type: String, default: 'Indonesia' },
    province_id: Number,
    province: String,
    city_id: Number,
    city: String,
    subdistrict_id: { type: Number, default: '' }, // Kecamatan
    subdistrict: { type: String, default: '' },
    postal_code: Number,
    detail_address: String,
})

const MobileNumberSchema = new mongoose.Schema({
    country_code: String,
    mobile_number: String,
    isWhatsapp: Boolean,
    isDefault: Boolean,
    note: String,
})

const ClassSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    },
    content_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Content'
    },
    invoice_number: String,
    add_date: Date,
    expiry_date: Date,
})

export const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    favorite_topics: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    profession: {
        value: String, // ['employee', 'professional', 'business', 'investor', 'other']
        info: String, // to other
    },
    class: [ClassSchema],
    ktp_numb: String,
    address: [AddressSchema],
    mobile_numbers: [MobileNumberSchema],
    sales: {
        join_date: Date,
        commission: Number,
    }
},{ 
	collection: 'user_profiles',
	versionKey: false,
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});