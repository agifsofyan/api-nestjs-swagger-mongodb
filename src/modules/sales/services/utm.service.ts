import { 
	Injectable
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUTM } from '../interfaces/utm.interface';

@Injectable()
export class UTMService {
    constructor(
		@InjectModel('UTM') private readonly utmModel: Model<IUTM>,
	) {}

    async addUTM(input: any) {
        const query = new this.utmModel(input)
        await query.save()

        return query
    }

    async listOfUTM(status?: string) {
        var match:any = {}
        if(status) match.status = status;
        return await this.utmModel.find(match)
    }
}
