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
        phone_number: number,
        account: string,
        status: string,
        pay_uid: string,
        external_id: string,
        payment_id: string,
        payment_code: string,
        callback_id: string,
    };
    total_qty: number;
    total_price: number;
    invoice: string;
    expiry_date: Date;
}