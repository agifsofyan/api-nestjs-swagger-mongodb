import { Document } from 'mongoose';

export interface IItemCart extends Document {
    product_id: any;
    quantity: number;
    whenAdd: Date;
    whenExpired: Date;
}

export interface ICart extends Document {
    user_id: string;
    items?: Array<IItemCart>;
    modifiedOn: Date;
}
