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
import { average, findDuplicate, sum } from 'src/utils/helper';
import { IProduct } from '../product/interfaces/product.interface';
import { ITopic } from '../topic/interfaces/topic.interface';

@Injectable()
export class RatingService {
    constructor(
		@InjectModel('Rating') private readonly ratingModel: Model<IRating>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
    ) {}
    
    // async storeCheck(input: any) {
    //     const { kind, kind_id, rate } = input
    //     // user_id = ObjectId(input.rate.user_id) // to test
    //     const checkRate = await this.ratingModel.findOne({kind: kind, kind_id: kind_id, "rate.user_id": rate.user_id });
    //     console.log('checkRate', checkRate)
    //     if(checkRate){
    //         return true
    //     }

    //     return false
    // }
    
    // async push(input: any) {
    //     let regex = /[1-5]/
    //     const inRange = regex.test(input.rate.value)

    //     if(!inRange){
    //         throw new BadRequestException('rate.value value is: 1 - 5')
    //     }

    //     const checkRate = await this.ratingModel.findOneAndUpdate(
    //         {kind: input.kind, kind_id: input.kind_id}, 
    //         {$push: { rate: input.rate }},
    //         {upsert: true, new: true, runValidators: true}
    //     )
    //     return {
    //         rating_id: checkRate._id
    //     }
    // }
    
    // async percentage(input: any) {
    //     const ratings = await this.ratingModel.find({kind: input.kind, kind_id: input.kind_id})
    //     const avg = average(ratings, 'rate')

    //     const result = {
    //         kind: input.kind,
    //         kind_id: input.kind_id,
    //         rate: ratings,
    //         average: avg
    //     }

    //     return result
    // }

    async avg(field: string, avg?: any) {
        var match = {}

        if(field){
            match = {kind:field}
        }
        const query = await this.ratingModel.find(match)
        const ratingMuch = findDuplicate(query, 'rate', null, null, null, 'key', 'asc')

        const rateCount = ratingMuch.map(rate => Number(rate.value))
        const total = sum(rateCount)
        const min = Math.min(...rateCount)
        const max = Math.max(...rateCount)

        const ratings = ratingMuch.map(rate => {
            return {
                rate: rate.key,
                count: rate.value,
                percent: Number(rate.value) / total * 100
            }
        })

        const averages = average(rateCount)

        if(avg === 'true' || avg === true){
            return {
                ratings: ratings,
                total_count: total,
                total_percent: sum(ratings, 'percent'),
                min: min,
                max: max,
                average: averages
            }
        }else{
            return ratings
        }
    }

    async addRating(input: any) {
        const checkRating = await this.ratingModel.findOne({user_id: input.user_id, kind_id: input.id})

        if(checkRating){
            throw new BadRequestException('You have already added a rating')
        }

		const rating = new this.ratingModel({
            user_id: input.user_id,
            kind: input.field,
            kind_id: input.id,
            rate: input.rate
        })
        
        try {
            await rating.save()
            
            if(input.field === 'product') {
                await this.productModel.findByIdAndUpdate(input.id, {rating: rating._id})
            }
    
            if(input.field === 'topic') {
                await this.topicModel.findByIdAndUpdate(input.id, {rating: rating._id})
            }

            console.log('input', input)
    
            // if(input.field === 'mentor') {
            //     await this.mentorModel.findByIdAndUpdate(input.id, {rating: rating._id})
            // }

        } catch (error) {
            throw new NotImplementedException('failed to add rating')   
        }

		return 'Success add rating'
	}
}
