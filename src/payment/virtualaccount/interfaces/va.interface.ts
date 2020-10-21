import { Document } from 'mongoose';

export interface IVirtualAccount extends Document {
    external_id: string;
    bank_code: string;
    name: string;
    virtual_account_number: number;
    suggested_amount: number;
    is_closed: boolean;
    expected_amount: boolean;
    expiration_date: Date;
    is_single_use: Boolean;
    description: String;
}