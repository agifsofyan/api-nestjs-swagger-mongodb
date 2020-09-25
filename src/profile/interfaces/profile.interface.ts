import { Document } from 'mongoose';

import { IUser } from '../../user/interfaces/user.interface';
import { IProfileExperience } from './profile-experience.interface';
import { IProfileAchievement } from './profile-achievement.interface';
import { IProfileAddress } from './profile-address.interface';

export interface IProfile extends Document {
    readonly user: IUser;
    bio: string;
    birth_place: string;
    birth_date: Date;
    religion: string;
    address: IProfileAddress[];
    // skills?: [string];
    experience: IProfileExperience[];
    achievement: IProfileAchievement[];
    readonly created_at: Date;
    updated_at: Date;
}
