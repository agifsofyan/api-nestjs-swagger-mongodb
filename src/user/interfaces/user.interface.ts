import { Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: string;
    last_login: Date;
    type: string;
    readonly created_at: Date;
    updated_at: Date;
}
