import { 
	Injectable,
	NotImplementedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGeneralSettings } from './interfaces/general-settings.interface';

@Injectable()
export class GeneralSettingsService {
    constructor(
		@InjectModel('GeneralSetting') private readonly generalModel: Model<IGeneralSettings>
	) {}

    async setGeneral(input: any) {
        // input.isActive = true
        // console.log(input)
        try {
            await this.generalModel.findOneAndUpdate(
                { isActive: true },
                input,
                { upsert: true, new: true }
            )

            return await this.getGeneral()
        } catch (error) {
            throw new NotImplementedException("general setting can't updated")
        }
	}

    async getGeneral() {
        return await this.generalModel.findOne({isActive: true}).then(response => {
            response = response.toObject()  
            if(response){
                delete response.privacy_policy
                delete response.term_condition
                delete response.faq
                delete response.isActive
                delete response.product_bonus_active
                delete response.home_page
            }
            return response
        })
    }
    
    async getPrivacyPolice() {
        return await this.generalModel.findOne({isActive: true}).then(response => response.privacy_policy)
    }

    async getTermCondition() {
        return await this.generalModel.findOne({isActive: true}).then(response => response.term_condition)
    }

    async getFaq() {
        return await this.generalModel.findOne({isActive: true}).then(response => response.faq)
    }

    async setPrivacyPolice(privacyPolice: any) {
        const { privacy_policy } = privacyPolice
        try {
            await this.generalModel.findOneAndUpdate(
                { isActive: true },
                { privacy_policy: privacy_policy },
                { upsert: true, new: true }
            )

            return await this.getPrivacyPolice()
        } catch (error) {
            throw new NotImplementedException("privacy police can't updated")
        }
    }

    async setTermCondition(termCondition: any) {
        const { term_condition } = termCondition
        try {
            await this.generalModel.findOneAndUpdate(
                { isActive: true },
                { term_condition: term_condition },
                { new: true }
            )

            return await this.getTermCondition()
        } catch (error) {
            throw new NotImplementedException("term & condition can't updated")
        }
    }

    async setFaq(input: any) {
        const { faq } = input
        try {
            await this.generalModel.findOneAndUpdate(
                { isActive: true },
                { faq: faq },
                { new: true }
            )

            return await this.getFaq()
        } catch (error) {
            throw new NotImplementedException("faq can't updated")
        }
    }

    async setBonus(input: any) {
        const { product_bonus_id } = input
        try {
            await this.generalModel.findOneAndUpdate(
                { isActive: true },
                { product_bonus_active: product_bonus_id },
                { new: true }
            )

            return await this.getBonus()
        } catch (error) {
            throw new NotImplementedException("can't set the product bonus")
        }
    }

    async getBonus() {
        const query = await this.generalModel.findOne({isActive: true}).populate('product_bonus_active')
        return query.product_bonus_active
    }

    async setHomePage(form: any) {
        const { image, video, product_id } = form

        try {
            await this.generalModel.findOneAndUpdate(
                { isActive: true },
                { home_page: { image: image, video: video, product: product_id } },
                { new: true, upsert: true }
            )

            return await this.getHomePage()
        } catch (error) {
            throw new NotImplementedException("can't set the homepage section")
        }
    }

    async getHomePage() {
        const query = await this.generalModel.findOne({isActive: true}).populate('home_page.product')
        return query.home_page
    }
}
