import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IProfile } from './interfaces/profile.interface';
import { IUser } from '../user/interfaces/user.interface';
import { CreateProfileAddressDTO } from './dto/create-profile-address.dto';
import { CreateProfileExperienceDTO } from './dto/create-profile-experience.dto';
import { CreateProfileAchievementDTO } from './dto/create-profile-achievement.dto';

@Injectable()
export class ProfileService {
    constructor(@InjectModel('Profile') private profileModel: Model<IProfile>) {}

    /** Create */
    async createProfile(profileDTO: any, user: IUser): Promise<IProfile> {
        const profile = await this.profileModel.findOneAndUpdate(
            { user: user['userId'] },
            { $set: profileDTO },
            { new: true, upsert: true }
        );

        return profile;
    }

    async createAddress(addressDTO: CreateProfileAddressDTO, user: IUser): Promise<IProfile> {
        const profile = await this.profileModel.findOne({ user: user['userId'] });
        profile.address.unshift(addressDTO);
        return await profile.save();
    }

    async createExperience(experienceDTO: CreateProfileExperienceDTO, user: IUser): Promise<IProfile> {
        const profile = await this.profileModel.findOne({ user: user['userId'] });
        profile.experience.unshift(experienceDTO);
        return await profile.save();
    }

    async createAchievement(achievementDTO: CreateProfileAchievementDTO, user: IUser): Promise<IProfile> {
        const profile = await this.profileModel.findOne({ user: user['userId'] });
        profile.achievement.unshift(achievementDTO);
        return await profile.save();
    }
}
