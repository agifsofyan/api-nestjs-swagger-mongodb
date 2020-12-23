import { Document } from 'mongoose';

export interface ICoupon extends Document {
     name: string;
     code: string;
     value: number;
     start_date: string;
     end_date: string;
     max_discount: number;
     payment_method: string;
     type: any;
     product_id: any;
     tag: [any];
}
