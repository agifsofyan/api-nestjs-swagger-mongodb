import { 
	BadRequestException,
	Injectable, 
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IActivity } from './interface/activity.interface';
import { IProfile } from '../profile/interfaces/profile.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ActivityService {
    constructor(
		@InjectModel('Activity') private readonly activityModel: Model<IActivity>,
		@InjectModel('Profile') private readonly profileModel: Model<IProfile>,
	) {}

    async actProgress(user:any, type:string, id:string) {
        const now = new Date()

		var profile = await this.profileModel.findOne({ user })
		const isExist = profile.class[type] ? profile.class[type].toString() : null;

		var body:any = { progress: 100}
		body[type] = id

		if(isExist != null && isExist != id){
			profile.class.unshift(body)
			await profile.save()
		}

		return profile.class
    }
}
