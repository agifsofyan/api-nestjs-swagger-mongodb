import { Document } from 'mongoose';
import { IUser } from '../../user/interfaces/user.interface';
import { IExperience } from './experience.interface';
import { IAchievement } from './achievement.interface';

export interface IProfile extends Document {
    readonly user: IUser;
    bio: string;
    birth_place: string;
    birth_date: Date;
    religion: string;
    location: string;
    // skills?: [string];
    experiences: IExperience[];
    achievements: IAchievement[];
    readonly created_at: Date;
    updated_at: Date;
}
