import { Document } from 'mongoose';

export interface ICart extends Document {
    user?: string;
    total_qty?: number;
    total_price?: number;
    items: Array<{
        product: string;
        variant: string; // ex: color, condition, special, size, etc, type,
        qty: number;
        note: string; // note for seller,
    }>;
    coupon?: string; // coupon code , reference coupon. value is coupon id,
}