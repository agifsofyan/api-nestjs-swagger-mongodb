import { Document } from 'mongoose';

export interface IPaymentMethod extends Document {
    name: string;
    info: string;
    vendor: string;
    isActive: boolean;
}