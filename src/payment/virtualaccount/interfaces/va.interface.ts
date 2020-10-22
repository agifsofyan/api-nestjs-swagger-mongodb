import { Document } from 'mongoose';

export interface IVirtualAccount extends Document {
    ip: string;
    currency: string;
    bank_code: string;
    merchant_code: string;
    name: string;
    account_number: string;
    is_single_use: string;
    expiration_date: Date;
    external_id: string;
    owner_id: string;
    user_id: string;
    va_id: string;
}