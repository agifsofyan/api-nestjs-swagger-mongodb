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

    async setAnything(input: any, field?: string) {
        console.log(input)
        try {
            await this.generalModel.findOneAndUpdate(
                { isActive: true },
                input,
                { upsert: true, new: true }
            )

            return await this.getAnything(field)
        } catch (error) {
            var msg = !field ? 'general setting' : field
            throw new NotImplementedException(`${msg} can't updated`)
        }
    }

    async getAnything(field?: string) {
        return await this.generalModel.findOne({isActive: true})
        .populate('home_page.product')
        .populate('on_page.product', ['_id', 'name', 'type', 'visibility', 'image_url'])
        .then(res => {
            if(res){
                var response = res.toObject()
                if(!field){
                    delete response.privacy_policy
                    delete response.term_condition
                    delete response.faq
                    delete response.isActive
                    delete response.home_page
                    delete response.on_header
                    delete response.on_page
                    delete response.on_content

                    return response
                }else{
                    return response[field]
                }
            }
        })
    }
}
