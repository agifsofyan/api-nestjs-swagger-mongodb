import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IProfile } from './interfaces/profile.interface';

@Injectable()
export class ProfileService {
    constructor(@InjectModel('Profile') private profileModel: Model<IProfile>) {}

    /** Create */
    async createProfile(profileDTO, user): Promise<IProfile> {
        const profile = await this.profileModel.findOneAndUpdate(
            { user: user['userId'] },
            { $set: profileDTO },
            { new: true, upsert: true }
        );

        return profile;
    }

    private async storeProfile(user): Promise<IProfile> {
        const profile = await this.profileModel.findOneAndUpdate(
            { user: user['userId'] },
            { $set: { user: user['userId'] } },
            { new: true, upsert: true }
        );

        return profile;
    }

    async createAddress(addressDTO, user): Promise<IProfile> {
        var profile = await this.profileModel.findOne({ user: user['userId'] });
        
        if(!profile){
            profile = await this.storeProfile(user)
        }

        profile.address.unshift(addressDTO);
        return await profile.save();
    }

    async createExperience(experienceDTO, user): Promise<IProfile> {
        var profile = await this.profileModel.findOne({ user: user['userId'] });

        if(!profile){
            profile = await this.storeProfile(user)
        }

        profile.experience.unshift(experienceDTO);
        return await profile.save();
    }

    async createAchievement(achievementDTO, user): Promise<IProfile> {
        var profile = await this.profileModel.findOne({ user: user['userId'] });

        if(!profile){
            profile = await this.storeProfile(user)
        }

        profile.achievement.unshift(achievementDTO);
        return await profile.save();
    }

    /** Get Profile */
    async getProfile(user): Promise<IProfile> {
        const profile = await this.profileModel.findOne({ user: user['userId'] }).populate('user', ['name', 'email', 'phone_number', 'avatar'])

        return profile;
    }

    /** Get all Address */
    async getAddress(user) {
        const address = await this.profileModel.findOne({ user: user['userId'] })

        console.log(address)

        return (!address) ? [] : address.address
    }

    /** Get Address by address ID  */
    async getOneAddress(user, addressId) {
        try {
            const address = await this.profileModel.find(
                { "user": user['userId'], "address._id": addressId },
                {_id: 0, address: {$elemMatch: {_id: addressId}}}
            )
            return address.length > 0 ? address[0].address[0] : {}
        } catch (error) {
            throw new NotImplementedException('address id not valid')
        }

    }
}
