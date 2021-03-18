import * as mongoose from 'mongoose';

const PrivacyPoliceSchema = new mongoose.Schema({
    title: String,
    option: [{
        value: String
    }],
    note: { type: String, default: "" },
})

const TermConditionSchema = new mongoose.Schema({
    title: String,
    option: [{
        value: String
    }],
    note: { type: String, default: "" },
})

const FAQSchema = new mongoose.Schema({
    question: String,
    answer: String,
    note: { type: String, default: "" },
})

export const GeneralSettingSchema = new mongoose.Schema({
    logo: {
        value: String,
        note: { type: String, default: "" },
    },
    
    favicon: {
        value: String,
        note: { type: String, default: "" },
    },

    site_title: {
        value: String,
        note: { type: String, default: "" },
    },

    address: {
        value: String,
        note: { type: String, default: "" },
    },

    whatsapp: {
        value: String,
        note: { type: String, default: "" },
    },

    // kebijakan privasi
    privacy_policy: [PrivacyPoliceSchema],

    // Syarat & Ketentuan
    term_condition: [TermConditionSchema],

    // Pertanyaan Umum
    faq: [FAQSchema],

    isActive: { type: Boolean, default: false }
},{
    collection: 'general-settings',
    versionKey: false
});
