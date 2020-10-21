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