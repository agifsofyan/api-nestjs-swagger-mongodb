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
          icon: string;
     }>;

     agent: Array<{
          id: string;
          name: string;
     }>;

     image_bonus_url: [string];
     media_url: [string];
     image_product_url: [string];
     image_url: [string]; // Array
     video_link: string;

     section: Array<{
          title: string;
          content: string;
          image: string;
     }>;

     learn_about: Array<{
          title: String;
          content: String;
     }>;

     feature: {
     	feature_onheader: string;
     	feature_onpage: string;
     };

     bump: Array<{
          bump_name: string,
          bump_price: number,
          bump_weight: number,
          bump_image: string,
          used: boolean
     }>;
}