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
        let regex = /[1-5]/
        const inRange = regex.test(input.rate.value)

        if(!inRange){
            throw new BadRequestException('rate.value value is: 1 - 5')
        }

        const checkRate = await this.ratingModel.findOneAndUpdate(
            {kind: input.kind, kind_id: input.kind_id}, 
            {$push: { rate: input.rate }},
            {upsert: true, new: true, runValidators: true}
        )
        return {
            rating_id: checkRate._id
        }
    }

    private average(arr: any, sub: string) {
        const { length } = arr;
        return arr.reduce((acc, val) => {
            return acc + (val[sub]/length);
        }, 0)
    }
    
    async percentage(input: any) {
        console.log('input-->', input)
        const rate = await this.ratingModel.findOne({kind: input.kind, kind_id: input.kind_id}).then(res => res["rate"])
        console.log('rate', rate)
        const avg = this.average(rate, 'value')
        return {
            kind: input.kind,
            kind_id: input.kind_id,
            rate: rate,
            average: avg
        }
    }
}
