import { Document } from 'mongoose';

export interface ICreditCard extends Document {
    amount: number;        
    card_number: number;        
    card_exp_month: number;        
    card_exp_year: number;       
    card_cvn: number;
    is_multiple_use: boolean;
    should_authenticate: boolean;
}

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
