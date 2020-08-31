import { Document } from 'mongoose';

export interface IProfile extends Document {
    readonly userId: string;
    readonly birth_place: string;
    readonly birth_date: string;
    readonly religion: string;
    readonly created_at: Date;
    readonly updated_at: Date;
}
