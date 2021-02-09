import { Document } from 'mongoose';

export interface IUC extends Document {
     topic: string;
     email: string;
     name: string;
     phone_number: string;
}
