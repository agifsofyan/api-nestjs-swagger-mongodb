import { Document } from 'mongoose';

export interface IItemCart extends Document {
    user_id: string;
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
    items?: Array<IItemCart>;
    modifiedOn: Date;
}
