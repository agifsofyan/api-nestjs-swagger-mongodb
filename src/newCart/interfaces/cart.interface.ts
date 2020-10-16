import { Document } from 'mongoose';

export interface ICart extends Document {
    user: string;
    items: Array<{
        product: string;
        variant: string;
        qty: number;
        note: string;
        shipment: string;
        isActive: boolean;
    }>;
    coupon: string;
    total_qty: number;
    total_price: number;
    expiry_date: Date;
    status: string;
}