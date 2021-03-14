import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
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

    async create(input: any) {
        try {
            const query = new this.generalModel(input)
            return await query.save()
        } catch (error) {
            throw new NotImplementedException('cannot create the general setting')
        }
	}
}
