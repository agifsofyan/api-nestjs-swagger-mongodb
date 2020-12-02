import { Document } from 'mongoose';

export interface IAdmin extends Document {
    name: string;
    email: string;
    phone_number: string;
    password: string;
    role: [any];
}
