import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IProfile } from './interfaces/profile.interface';
import { IUser } from '../user/interfaces/user.interface';

@Injectable()
export class ProfileService {
    constructor(@InjectModel('Profile') private profileModel: Model<IProfile>) {}

    async createUpdate(profileDTO: any, user: IUser): Promise<IProfile> {
        // const profile = await this.profileModel.create({
        //     ...profileDTO,
        //     user
        // });
        // await profile.save();
        // return profile.populate('user', ['email', 'avatar']);

        const profile = await this.profileModel.findOneAndUpdate(
            { user },
            { $set: profileDTO },
            { new: true, upsert: true }
        );
        return profile;
    }

    async createExperience(experienceDTO: any, user: IUser): Promise<IProfile> {
        const profile = await this.profileModel.findOne({ user });
        profile.experience.unshift(experienceDTO);
        return await profile.save();
    }

    async createAchievement(achievementDTO: any, user: IUser): Promise<IProfile> {
        const profile = await this.profileModel.findOne({ user });
        profile.experience.unshift(achievementDTO);
        return await profile.save();
    }
}
