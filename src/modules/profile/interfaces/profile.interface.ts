import { Document } from 'mongoose';

import { IUser } from '../../user/interfaces/user.interface';
import { IProfileAddress } from './profile-address.interface';
import { IProfileClass } from './profile-class.interface';
import { IProfilePhoneNumber } from './profile-phonenumber.interface';

export enum ProfessionValue {
    EMPLOYEE='employee',
    PROFESSIONAL='professional',
    BUSINESS='business',
    INVESTOR='investor',
    OTHER='other',
}

export interface IProfile extends Document {
    user: IUser;
    favorite_topics: string[];
    profession: {
        value: ProfessionValue, // ['employee', 'professional', 'business', 'investor', 'other']
        info: string, // to other
    };
    class: IProfileClass[];
    ktp_numb: string;
    ktp_verified: boolean;
    address: IProfileAddress[];
    phone_numbers: IProfilePhoneNumber[];
    sales: {
        join_date: Date,
        commission: number,
    };

    created_at: Date;
    updated_at: Date;
}