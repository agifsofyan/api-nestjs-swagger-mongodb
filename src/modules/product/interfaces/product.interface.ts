import { Document } from 'mongoose';

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

     boe: object; // before webinar

     ecommerce: object;

     sale_method: string; // enum

     topic: [string];
     agent: [string];

     image_url: [string]; // Array
     image_bonus_url: string;
     media_url: string;

     section: Array<object>;

     learn_about: Array<object>;

     feature: object;

     bump: Array<object>;

     hashtag: Array<string>;
}
