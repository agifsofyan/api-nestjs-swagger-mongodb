import { Document } from 'mongoose';

export interface IPaymentMethod extends Document {
    name: String;
    info: String;
}