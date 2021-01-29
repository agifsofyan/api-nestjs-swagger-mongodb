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
import { countMax } from 'src/utils/helper';
import { agent } from 'supertest';

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

    private average(arr: any, sub?: string) {
        const { length } = arr;
        console.log('arr', arr)
        if(sub){
            return arr.reduce((acc, val) => {
                return acc + (val[sub]/length);
            }, 0)
        }else{
            return arr.reduce((acc, val) => {
                return acc + (val/length);
            }, 0)
        }
    }
    
    async percentage(input: any) {
        const rate = await this.ratingModel.findOne({kind: input.kind, kind_id: input.kind_id}).then(res => res["rate"])
        const avg = this.average(rate, 'value')
        const result = {
            kind: input.kind,
            kind_id: input.kind_id,
            rate: rate,
            average: avg
        }

        return result
    }

    private getCol = (matrix) => {
        var column = [];
        for(var i=0; i<matrix.length; i++){
            column.push(...matrix[i]);
        }

        return column.map(res => {
            return {value: res}
        })
    }

    // private getCount = (arr, x) => {
    //     var res = {};
    //     for(let j in arr){
    //         const hasOwn = res.hasOwnProperty(x)
    //         if(hasOwn){
    //             res[x]++;
    //         }else{
    //             res[x] = 1;
    //         }
    //     }
    // }

    async countRate(average?: any) {
        const query = await this.ratingModel.find({kind: 'category'})
        const parse = countMax(query, 'rate', 'value')
        const avg = this.average(parse.array)

        if(average === 'true' || average === true){
            return {
                average: avg,
                parse
            }
        }else{
            return query
        }
        
    }
}
