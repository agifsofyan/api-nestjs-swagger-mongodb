import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IProfile } from './interfaces/profile.interface';
import { IUser } from '../user/interfaces/user.interface';

@Injectable()
export class ProfileService {
    constructor(@InjectModel('Profile') private profileModel: Model<IProfile>) {}

    async create(profileDTO: any, user: IUser): Promise<IProfile> {
        const profile = await this.profileModel.create({
            ...profileDTO,
            user
        });
        await profile.save();
        return profile.populate('user', ['email', 'avatar']);
    }
}
