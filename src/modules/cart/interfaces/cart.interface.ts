import { Document } from 'mongoose';

export interface IItemCart extends Document {
    product_info: any;
    quantity: number;
    whenAdd: Date;
    whenExpired: Date;
}

export interface ICart extends Document {
    user_info: any;
    items?: Array<IItemCart>;
    modifiedOn: Date;
}
