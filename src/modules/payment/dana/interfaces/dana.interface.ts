import { Document } from 'mongoose';

export interface IDana extends Document {
     merchant_trans_id: string
     acquirement_id: string
     invoice_number: string
     checkout_url: string
     user_id: string
     total_price: number
}
