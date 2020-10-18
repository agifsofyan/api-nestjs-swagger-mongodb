import { Document } from 'mongoose';

export interface IProduct extends Document {
    _id: string;
    type: string; // Enum
    name: string;
    slug: string; // Unique
    code: string;
    visibility: string; // Enum
    headline: string;
    description: string;
    time_period: number;
    price: number;
    sale_price: number;
    image_url: string; // Array
    video_link: string;
    created_by: string;
    updated_by: string;

    webinar: {
        date: string,
        duration: string,
        start_time: string,
        // end_time: string;
        client_url: string
    };

    ecommerce: {
        weight: number;
        shipping_charges: boolean;
        stock: number;
    };

    sale_method: string; // enum

    topic: Array<{
        id: string;
        name: string;
    }>;

    agent: Array<{
        id: string;
        name: string;
    }>;

    image_bonus_url: [string];
    image_text_url: [string];
    image_product_url: [string];

    section: Array<{
        title: string;
        content: string;
    }>;

    learn_about: Array<{
        title: String;
        content: String;
    }>;

    feature: {
        feature_onheader: string;
        feature_onpage: string;
    };
    // on_sale: boolean;

    bump: Array<{
        bump_name: string,
        bump_price: number,
        bump_weight: number,
        bump_image: string
    }>;
    created_at?: Date;
    updated_at?: Date;
    // rating: object[];
}