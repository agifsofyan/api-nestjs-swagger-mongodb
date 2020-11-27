import { Document } from 'mongoose';

export interface IAdmin extends Document {
    readonly name: string;
    readonly email: string;
    readonly phone_number: string;
    password: string;
    role: [any];
}
