import { Document } from 'mongoose';

export interface IBoe extends Document {
     date: string;
     duration: string;
    	start_time: string;
    	client_url: string;
     beginTime: string;
     endTime: string;
}

export interface IEcommerce extends Document {
     weight: number; //in gram
     shipping_charges: boolean;
     stock: number;
}

export interface ISection extends Document {
     title: string
     content: string;
     image: string;
}

export interface ILearn extends Document {
     title: string;
     content: string;
     note: string;
}

export interface IBump extends Document {
     bump_name: string;
    	bump_price: number;
     bump_weight: number; // in gram
     bump_image: string;
     bump_heading: string;
     bump_desc: string;
}

// export interface IFeature extends Document {
//      feature_onheader: string;
//      active_header: boolean; // true = ref to feature_onheader
//      active_page: boolean; // true = ref to img_url
// }

export interface IBonus extends Document {
     image: string;
     title: string;
     description: string;
}

export interface IProduct extends Document {
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

     created_by: string;
     updated_by: string;

     boe: IBoe; // before webinar

     ecommerce: IEcommerce;

     sale_method: string; // enum

     topic: [string];
     agent: [string];

     image_url: [string]; // Array
     media_url: string;

     bonus: IBonus;

     section: ISection[];

     learn_about: ILearn[];

     // feature: IFeature;

     bump: IBump[];

     tag: [any];

     rating: string;
}
