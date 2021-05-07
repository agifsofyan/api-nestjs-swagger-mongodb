import { 
	BadRequestException,
	Injectable, 
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IActivity } from './interface/activity.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ActivityService {
    constructor(
		@InjectModel('Activity') private readonly activityModel: Model<IActivity>
	) {}

    async actProgress(user:any, type:string, id:string) {
        const userID = user._id
        const now = new Date()

        var activity = await this.activityModel.findOne({ user: userID })

        if(!activity){
            activity = new this.activityModel({ user: user })
            // await activity.save()
        }
        
        var body:any = {
            _id: ObjectId(id),
            kind: type,
            datetime: new Date()
        }

        const hasType = activity.progress.find(val => val._id.toString() == id)

        if(!hasType){
            activity.progress.push(body)
        }
        await activity.save()

		return activity.progress
    }
}
