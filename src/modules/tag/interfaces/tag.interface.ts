import { Document } from 'mongoose';

export interface ITag extends Document {
     name: string; // Unique
     product: [any];
     content: [any];
     order: [any];
     coupon: [any];
}
