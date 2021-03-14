import * as mongoose from 'mongoose';

const PrivacyPoliceSchema = new mongoose.Schema({
    title: String,
    option: [{
        value: String
    }],
    note: { type: String, default: null },
})

const TermConditionSchema = new mongoose.Schema({
    title: String,
    option: [{
        value: String
    }],
    note: { type: String, default: null },
})

const FAQSchema = new mongoose.Schema({
    question: String,
    answer: String,
    note: { type: String, default: null },
})

export const GeneralSettingSchema = new mongoose.Schema({
    logo: {
        value: String,
        note: { type: String, default: null },
    },
    
    favicon: {
        value: String,
        note: { type: String, default: null },
    },

    site_title: {
        value: String,
        note: { type: String, default: null },
    },

    address: {
        value: String,
        note: { type: String, default: null },
    },

    whatsapp: {
        value: String,
        note: { type: String, default: null },
    },

    // kebijakan privasi
    privacy_policy: [PrivacyPoliceSchema],

    // Syarat & Ketentuan
    term_condition: [TermConditionSchema],

    // Pertanyaan Umum
    faq: [FAQSchema]
},{
    collection: 'general-settings',
    versionKey: false
});
