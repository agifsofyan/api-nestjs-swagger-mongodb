import { Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: string;
    last_login: Date;
    // type: string;
    role: [string];
    is_confirmed: Date;
    is_forget_pass: Date;
    otp: string;
    created_at: Date;
    updated_at: Date;
}
