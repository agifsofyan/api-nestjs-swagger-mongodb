import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IRating } from './interfaces/rating.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class RatingService {
    constructor(
		@InjectModel('Rating') private readonly ratingModel: Model<IRating>
    ) {}
    
    async store(input: any, user_id: string) {
        ObjectId(input.kind_id)
        input.rate.user_id = user_id
        const query = new this.ratingModel(input);
		return await query.save();
    }
    
    async storeCheck(input: any) {
        const { kind, kind_id, rate } = input
        // user_id = ObjectId(input.rate.user_id) // to test
        const checkRate = await this.ratingModel.findOne({kind: kind, kind_id: kind_id, "rate.user_id": rate.user_id });
        console.log('checkRate', checkRate)
        if(checkRate){
            return true
        }

        return false
    }
    
    async push(input: any) {
        ObjectId(input.kind_id)
        console.log('input', input)
        const checkRate = await this.ratingModel.findOneAndUpdate(
            {kind: input.kind, kind_id: input.kind_id}, 
            {$push: { rate: input.rate }},
            {upsert: true, new: true, runValidators: true}
        )
        return {
            rating_id: checkRate._id
        }
	}
}
