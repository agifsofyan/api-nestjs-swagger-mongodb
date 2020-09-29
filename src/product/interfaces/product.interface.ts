import { Document } from 'mongoose';

export interface IProduct extends Document {
    _id: string;
    code: string;
    type: string;
    name: string;
    slug: string; 
    visibility: string; 
    readonly topic: string[];
    image_url: string;
    video_url: string;
    headline: string;
    description: string;
    feedback: string;
    time_period: string;
    price: number;
    on_sale: boolean;
    sale_price: number;
    webinar: {
        date: string;
        duration: string;
        start_time: string;
        end_time: string;
        client_url: string;
    };
    sale_method: string; 
    product_redirect: string[];
    readonly agent: string[];
    image_bonus_url: string[];
    image_text_url: string[];
    image_product_url: string[];
    section: string;
    feature: {
        feature_onpage: string;
        feature_onheader: string;
    };
    created_at?: Date;
    updated_at?: Date;
    bump: object[];
}