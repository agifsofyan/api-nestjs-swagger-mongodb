import { BadGatewayException, BadRequestException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RajaongkirService } from '../rajaongkir/rajaongkir.service';
import { IUser } from '../user/interfaces/user.interface';
import { IProfile } from './interfaces/profile.interface';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { EmailValidation, NumberValidation, PhoneIDRValidation } from 'src/utils/CustomValidation';

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel('User') private userModel: Model<IUser>,
        @InjectModel('Profile') private profileModel: Model<IProfile>,
        private readonly rajaongkirService: RajaongkirService,
        private readonly mailService: MailService
    ) {}

    async storeProfile(user:any, profileDTO?: any): Promise<IProfile> {
        var input:any = { user }
        if(profileDTO){
            input = profileDTO;
            input.is_confirmed = null
            input.ktp_verified = false

            const profession = ['employee', 'professional', 'business', 'investor', 'other']

            if(input.profession){
                if(!profession.includes(input.profession.value)){
                    throw new BadRequestException('invalid profession value. Available is: ' + profession)
                }else{
                    if(input.profession.value == 'other' && !input.profession.info){
                        throw new BadGatewayException('profession.info is required if profession.value = other')
                    }

                    if(input.profession.info) input.profession.info = input.profession.info.toLowerCase();
                }
            }

            if(input.password === '') delete input.password
            if(input.email === '') delete input.email
            if(input.email && input.email !== ''){
                const emailValid = EmailValidation(input.email)
                if(!emailValid) throw new BadRequestException('email not valid');
                const emailExist = await this.userModel.findOne({email: input.email, _id: {$nin: user._id}})
                if(emailExist) throw new BadRequestException('email already exist');
            }

            const hp = input.phone_numbers
            let hpWa = []
            let HpDefault = []

            if(hp){
                hp.forEach(el => {
                    const phoneValid = PhoneIDRValidation(el.phone_number)

                    if(!phoneValid) throw new BadRequestException('phone number not valid, min: 10, max: 13');
                    
                    if(el.phone_number.charAt(0) === '0'){
                        el.phone_number = el.phone_number.substring(1);
                    }

                    if(el.isWhatsapp == true) hpWa.push(el.isWhatsapp);
                    if(el.isDefault == true) HpDefault.push(el.isDefault);
                });

                if(hpWa.length > 1){
                    throw new BadGatewayException('whatsapp only to one phone number')
                }

                if(HpDefault.length > 1){
                    throw new BadGatewayException('default phone number only one')
                }
            }

            if(input.ktp_numb){
                if(typeof input.ktp_numb !== 'string') throw new BadRequestException('ktp number must be numeric string');
                if(!NumberValidation(input.ktp_numb)) throw new BadRequestException('ktp number must be numeric string');
                if(input.ktp_numb.length !== 16) throw new BadRequestException('ktp number length is 16 digit');
            }

            const salt = await bcrypt.genSalt(12);

            if(input.password) input.password = await bcrypt.hash(input.password, salt);

            const userAccount = await this.userModel.findOneAndUpdate(
                { _id: user._id },
                { $set: input },
                { new: true, upsert: true }
            )

            // if(input.email) {
            //     const data = {
            //         name: userAccount.name,
            //         from: "Verification " + process.env.MAIL_FROM,
            //         to: userAccount.email,
            //         subject: 'Please confirm your LARUNO account',
            //         type: 'verification'
            //     }
        
            //     await this.mailService.templateGenerate(data)
            // }
        }
        
        let profile = await this.profileModel.findOneAndUpdate(
            { user },
            { $set: input },
            { new: true, upsert: true }
        );

        //profile = profile.toObject()
        delete profile.favorite_topics
        delete profile.class
        delete profile.address

        return this.getProfile(user)
    }

    async createAddress(input, user): Promise<IProfile> {
        const userID = user._id
        var profile = await this.profileModel.findOne({user: userID});
        if(!profile){
            profile = new this.profileModel({ input, user: userID })
        }
        
        const getCity = await this.rajaongkirService.cities(input.city_id, input.province_id)

        if(getCity.results.length <= 0){
            throw new NotFoundException('city not found in the province')
        }

        input.province = getCity.results.province
        input.city = getCity.results.city_name
        // input.subdistrict = getCity.results.sub_district_name
        input.postal_code = getCity.results.postal_code
        
        profile.address.unshift(input);
        await profile.save();
       
        return this.getProfile(user)
    }

    async addFavoriteTopics(input, user): Promise<IProfile> {
        
        var profile = await this.profileModel.findOne(user);
        if(!profile) profile = await this.storeProfile(user);
        
        profile = await this.profileModel.findOneAndUpdate(
            { user },
            input,
            { new: true, upsert: true }
        )

        return this.getProfile(user)
    }

    /** Get Profile */
    async getProfile(user: any): Promise<IProfile> {
    	
        var profile = await this.profileModel.findOne({user: user._id}).populate('user', ['_id', 'name', 'email', 'avatar']).populate('favorite_topics', ['_id', 'name', 'icon', 'url'])

        if(!profile){
            return null
        }

	    // profile = profile.toObject()
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
