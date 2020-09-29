import { Document } from 'mongoose';

import { IUser } from 'src/user/interfaces/user.interface';
import { Cart } from '../../utils/cart';
import { InvoiceStatus } from '../../utils/enum';
import { Address } from './order-address.interface';

export interface IOrder extends Document {
    orderId: string;
    invoiceId: string;
    readonly user: IUser;
    status: InvoiceStatus;
    currency: string;
    amount: number;
    payer_email: string;
    description: string;
    cart: Cart;
    address: Address[];
    invoice_url: string;
    expiry_date: Date;
    created_at: Date;
    updated_at: Date;
}