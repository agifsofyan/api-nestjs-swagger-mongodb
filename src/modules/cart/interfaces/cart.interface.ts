import { Document } from 'mongoose';

export interface IItemCart extends Document {
    product_info: any;
    quantity: number;
    whenAdd: Date;
    whenExpired: Date;
    utm: string;
}

export interface ICart extends Document {
    user_info: any;
    items: IItemCart[];
    modifiedOn: Date;
}
