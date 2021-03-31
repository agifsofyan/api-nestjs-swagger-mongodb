import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RajaongkirService } from '../rajaongkir/rajaongkir.service';

import { IProfile } from './interfaces/profile.interface';

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel('Profile') private profileModel: Model<IProfile>,
        private readonly rajaongkirService: RajaongkirService
    ) {}

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

    async createAddress(input, user): Promise<IProfile> {
        
        var profile = await this.profileModel.findOne(user);
        
        if(!profile){
            profile = await this.storeProfile(user)
        }
        
        const getCity = await this.rajaongkirService.cities(input.city_id, input.province_id)

        if(getCity.results.length <= 0){
            throw new NotFoundException('city not found in the province')
        }

        input.province = getCity.results.province
        input.city = getCity.results.city_name
        input.postal_code = getCity.results.postal_code
        
        profile.address.unshift(input);
        return await profile.save();
    }

    async addMobileNumber(input, user): Promise<IProfile> {
        
        var profile = await this.profileModel.findOne(user);
        
        if(!profile){
            profile = await this.storeProfile(user)
        }

        profile.mobile_numbers.unshift(input);
        return await profile.save();
    }

    /** Get Profile */
    async getProfile(user: any): Promise<IProfile> {
    	
        var profile = await this.profileModel.findOne({_id: user._id}).populate('user', ['_id', 'name', 'email', 'avatar'])

        if(!profile){
            return null
        }

	    profile = profile.toObject()
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
