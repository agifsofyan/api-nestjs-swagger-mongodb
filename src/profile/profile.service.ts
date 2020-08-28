import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IProfile } from './interfaces/profile.interface';
import { CreateProfileDTO } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
    constructor(@InjectModel('Profile') private readonly profileModel: Model<IProfile>) {}

    async createProfile(createProfileDTO: CreateProfileDTO): Promise<any> {
        const userProfile = new this.profileModel(createProfileDTO);
        await userProfile.save();
        return {
            message: 'User profile successfully created.',
            profile: userProfile
        }
    }
}
