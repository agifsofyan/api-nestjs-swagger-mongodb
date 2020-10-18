import { Document } from 'mongoose';

export interface ICart extends Document {
    user: string;
    items: Array<{
        product: string;
        variant: string;
        qty: number;
        note: string;
        shipment: string;
	whenAdd: Date;
	whenExpired: Date;
        isActive: boolean;
    }>;
    coupon: string;
    total_qty: number;
    total_price: number;
    create_date: Date;
    expiry_date: Date;
    status: string;
}
