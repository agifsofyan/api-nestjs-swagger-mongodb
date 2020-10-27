import { Document } from 'mongoose';

export interface IOrder extends Document {
    user_id: string;
    items: [{
        product_id: string,
        variant: string,
        note: string,
        is_bump: string,
        shipment_id: string,
        quantity: number,
        bump_price: number,
        sub_price: number
    }];
    coupon_id: string;
    payment: {
        method: string,
        account: string,
        status: string,
        external_id: string,
        payment_id: string,
        callback_id: string,
    };
    total_qty: number;
    total_price: number;
    invoice: string;
    expiry_date: Date;
}