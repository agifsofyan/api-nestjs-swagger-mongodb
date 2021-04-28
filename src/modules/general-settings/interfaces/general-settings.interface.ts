import { Document } from 'mongoose';

export interface IPrivacyPolice extends Document {
    title: string
    option: [{
        value: string
    }]
    note?: boolean
}

export interface ITermCondition extends Document {
    title: string
    option: [{
        value: string
    }]
    note?: string
}

export interface IFaq extends Document {
    question: string,
    answer: string,
    note?: string,
}


export interface IGeneralSettings extends Document {
    logo: {
        value: string,
        note?: string,
    }
    
    favicon: {
        value: string,
        note?: string,
    }

    site_title: {
        value: string,
        note?: string,
    }

    address: {
        value: string,
        note?: string,
    }

    whatsapp: {
        value: string,
        note?: string,
    }

    // kebijakan privasi
    privacy_policy: IPrivacyPolice[]

    // Syarat & Ketentuan
    term_condition: ITermCondition[]

    // Pertanyaan Umum
    faq: IFaq[]

    isActive: boolean

    home_page: {
        image: string[],
        video: string,
        product: string
    }

    on_header: {
        content: string,
        ctatext: string,
        ctalink: string
    }

    on_page: [
        {product: string}
    ]

    on_content: [{
        type: string,
        content: string,
        ctatext: string,
        ctalink: string
    }]

    image_module: string
}
