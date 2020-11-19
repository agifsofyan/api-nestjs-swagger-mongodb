import { Document } from 'mongoose';

export interface IOrder extends Document {
    user_id: string;
    items: [{
        product_id: string,
        variant: string,
        note: string,
        is_bump: boolean,
        quantity: number,
        bump_price: number,
        sub_price: number
    }];
    coupon: {
        name: string,
        code: string,
        value: number,
        max_discount: number
    };
    payment: {
        method: {
            name: string,
            info: string,
        },
        phone_number: number,
        status: string,
        pay_uid: string,
        external_id: string,
        payment_id: string,
        payment_code: string,
        callback_id: string,
    };

    shipment: {
        address_id: any,
        shipment_id: any
    },

    total_qty: number;
    total_price: number;
    invoice: string;
    create_date: Date;
    expiry_date: Date;

    status: string;
}
