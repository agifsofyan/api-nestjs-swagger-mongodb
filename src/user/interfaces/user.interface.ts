import { Document } from 'mongoose';

export interface IUser extends Document {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly phone_number: string;
    readonly last_login: Date;
    readonly created_at: Date;
    readonly updated_at: Date;
}
