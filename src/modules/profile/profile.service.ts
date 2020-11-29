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
            { user },
            { $set: profileDTO },
            { new: true, upsert: true }
        );

        return profile;
    }

    private async storeProfile(user): Promise<IProfile> {
        const profile = await this.profileModel.findOneAndUpdate(
            { user},
            { $set: { user } },
            { new: true, upsert: true }
        );

        return profile;
    }

    async createAddress(addressDTO, user): Promise<IProfile> {
        
        var profile = await this.profileModel.findOne(user);
        
        if(!profile){
            profile = await this.storeProfile(user)
        }

        profile.address.unshift(addressDTO);
        return await profile.save();
    }

    async createExperience(experienceDTO, user): Promise<IProfile> {
        var profile = await this.profileModel.findOne(user);

        if(!profile){
            profile = await this.storeProfile(user)
        }

        profile.experience.unshift(experienceDTO);
        return await profile.save();
    }

    async createAchievement(achievementDTO, user): Promise<IProfile> {
        var profile = await this.profileModel.findOne(user);

        if(!profile){
            profile = await this.storeProfile(user)
        }

        profile.achievement.unshift(achievementDTO);
        return await profile.save();
    }

    /** Get Profile */
    async getProfile(user): Promise<IProfile> {
    //console.log('user p', user)
        var profile = await this.profileModel.findOne({user}).populate('user', ['_id', 'name', 'email', 'phone_number', 'avatar'])
	//console.log('profile')
        delete profile.created_at
        delete profile.updated_at

        return profile;
    }

    /** Get all Address */
    async getAddress(user) {
        const getUser = await this.profileModel.findOne({user})
        return (!getUser) ? [] : getUser.address
    }

    /** Get Address by address ID  */
    async getOneAddress(user, addressId) {
        try {
            const address = await this.profileModel.find(
                { "user": user, "address._id": addressId },
                {_id: 0, address: {$elemMatch: {_id: addressId}}}
            )
            return address.length > 0 ? address[0].address[0] : {}
        } catch (error) {
            throw new NotImplementedException('address id not valid')
        }

    }
}
