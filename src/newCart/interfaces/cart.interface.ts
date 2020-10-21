import { Document } from 'mongoose';

export interface IItemCart extends Document {
    user_id: string;
    product_id: string;
    variant: string;
    quantity: number;
    sub_price: number;
    note: string;
    shipment_id: string;
    isActive: boolean;
    coupon_id: string;
    whenAdd: Date;
    whenExpired: Date;
    whenOrder: Date;
    order_id: string;
    isCheckout: boolean;
}

export interface ICart extends Document {
    user_id: string;
    items?: Array<IItemCart>;
    modifiedOn: Date;
}
