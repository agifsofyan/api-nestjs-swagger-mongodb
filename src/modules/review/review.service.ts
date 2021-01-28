import { 
	BadRequestException,
	Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OptQuery } from 'src/utils/OptQuery';
import { IReview } from './interfaces/review.interface';

@Injectable()
export class ReviewService {
    constructor(
		@InjectModel('Review') private readonly reviewModel: Model<IReview>
    ) {}
    
    async create(input: any) {
		const query = new this.reviewModel(input);
		return await query.save();
	}

	async all(options: OptQuery) {
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

		return await this.reviewModel.find(match).skip(skip).limit(limit).sort(sort)
		.populate({
			path: 'user',
			select: {_id:1, name:1, phone_number:1, email:1}
		})
		.populate({
			path: 'product',
			select: {_id:1, name:1, code:1, slug:1, type:1, visibility:1}
		})
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
