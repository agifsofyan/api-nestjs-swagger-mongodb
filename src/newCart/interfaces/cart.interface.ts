import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export interface IItemCart extends Document {
    product_id: string;
    variant: string;
    quantity: number;
    note: string;
    shipment_id: string;
    whenAdd: Date;
    whenExpired: Date;
    isActive: boolean;
    coupon_id: string;
}

export interface ICart extends Document {
    user_id: string;
    status: string;
    items?: IItemCart[];
    modifiedOn: Date;
}
