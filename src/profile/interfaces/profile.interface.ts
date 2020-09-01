import { Document } from 'mongoose';
import { IUser } from '../../user/interfaces/user.interface';

export interface IProfile extends Document {
    readonly user: IUser;
    readonly birth_place: string;
    readonly birth_date: string;
    readonly religion: string;
    readonly created_at: Date;
    readonly updated_at: Date;
}
