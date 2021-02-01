import { 
	BadRequestException,
	Injectable, 
	NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OptQuery } from 'src/utils/OptQuery';
import { IRating } from '../rating/interfaces/rating.interface';
import { IReview } from './interfaces/review.interface';

@Injectable()
export class ReviewService {
    constructor(
		@InjectModel('Review') private readonly reviewModel: Model<IReview>,
		@InjectModel('Rating') private readonly ratingModel: Model<IRating>,
    ) {}
    
    async create(input: any) {
		const check = await this.reviewModel.findOne({user:  input.user});

		if(check){
			return '302'
		}

		const query = new this.reviewModel(input);
		return await query.save();
	}

	async all(options: OptQuery, rating?: any) {
		const limit = Number(options.limit)
		const offset = Number(options.offset == 0 ? options.offset : (options.offset - 1));
		const skip = offset * limit;
		const sortval = (options.sortval == 'asc') ? 1 : -1;

		var match:any, sort:any = {}
		if (options.sortby){

			if(options.fields){
				match = { $where: `/^${options.value}.*/.test(this.${options.fields})` }
			}

			sort = { [options.sortby]: sortval }
		}else{
			if (options.fields) {
				match = { $where: `/^${options.value}.*/.test(this.${options.fields})` }
			}
			sort = { 'updated_at': 'desc' }
		}

		var review = await this.reviewModel.find(match).skip(skip).limit(limit).sort(sort)
		.populate({
			path: 'user',
			select: {_id:1, name:1, phone_number:1, email:1}
		})
		.populate({
			path: 'product',
			select: {_id:1, name:1, code:1, slug:1, type:1, visibility:1}
		})

		var resRate = new Array()
		var rate = new Array()
		if(rating === 'true' || rating === true){
			for(let i in review){
				rate[i] = await this.ratingModel.findOne({kind: 'product', kind_id: review[i].product}).then(val => {
					if(val){
						let filt = val.rate.filter(is => String(is.user_id) === String(review[i].user["_id"]))
						return filt.length > 0 ? filt[0] : null
					}
					return val
				})

				resRate[i] = {
					review: review[i],
					rating: rate[i]
				}
			}

			return resRate
		}
		
		return review
	}

	async byUID(uid: string, value: string) {
		var UUID: string
		if(uid === 'user_id'){
			UUID = 'user'
		}else if(uid === 'product_id'){
			UUID = 'product'
		}else{
			UUID = '_id'
		}

		const query = await this.reviewModel.findOne({[UUID]: value})
		.populate({
			path: 'user',
			select: {_id:1, name:1, phone_number:1, email:1}
		})
		.populate({
			path: 'product',
			select: {_id:1, name:1, code:1, slug:1, type:1, visibility:1}
		})

		if(!query){
			throw new NotFoundException(`review with ${uid} ${value} not found`)
		}

		return query
	}
}
