import { Document } from 'mongoose';

import { IUser } from 'src/user/interfaces/user.interface';
import { Cart } from '../../utils/cart';
import { InvoiceStatus } from '../../utils/enum';
import { Address } from './order-address.interface';

export interface IOrder extends Document {
    // order_id: string;
    // invoice_id: string;
    // readonly user: IUser;
    // status: InvoiceStatus;
    // currency: string;
    // amount: number;
    // payer_email: string;
    // description: string;
    // invoice_url: string;
    // expiry_date: Date;
    // cart: Cart;
    // address: Address[];
    // created_at: Date;
    // updated_at: Date;

    user_id: string;
    
    items: Array<{
        product_id: string;
        variant: string;
        quantity: number;
        sub_price: Number,
        note: string;
        shipment_id: string;
    }>;

    coupon_id: string;
    payment_id: string;
    total_qty: number,
    total_price: number,
    invoice: string;
    expiry_date: Date,
    status: string;
}