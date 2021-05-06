import { 
	BadRequestException,
	Injectable, 
	NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OptQuery } from 'src/utils/OptQuery';
import { IProduct } from '../product/interfaces/product.interface';
import { IRating } from '../rating/interfaces/rating.interface';
import { IReview } from './interfaces/review.interface';

@Injectable()
export class ReviewService {
    constructor(
		@InjectModel('Review') private readonly reviewModel: Model<IReview>,
		@InjectModel('Rating') private readonly ratingModel: Model<IRating>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
    ) {}
    
    async create(input: any) {
		const check = await this.reviewModel.findOne({user:  input.user});

		if(check){
			return '302'
		}

		if(!input.product && !input.content) throw new BadRequestException('product or content is required');

		const query = new this.reviewModel(input);
		query.save();

		return query
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
		.populate({
			path: 'content',
			select: {_id:1, isBlog:1, title:1, placement:1, post_type:1}
		})

		var resRate = new Array()
		var ratings = new Array()

		if(rating === 'true' || rating === true){
			for(let i in review){
				if(review[i].product === null || review[i].user === null){
					ratings[i] = 0
				}else{
					ratings[i] = await this.ratingModel.findOne({
						user_id: review[i].user["_id"],
						kind: 'product', 
						kind_id: review[i].product["_id"]
					}).then(val => {
						if(val === null) {
							return 0
						}else{
							return val.rate
						}
					})
				}
				

				resRate[i] = {
					review: review[i],
					rating: ratings[i]
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
		}else if(uid === 'content_id'){
			UUID = 'content'
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
		.populate({
			path: 'content',
			select: {_id:1, isBlog:1, title:1, placement:1, post_type:1}
		})

		if(!query){
			throw new NotFoundException(`review with ${uid} ${value} not found`)
		}

		return query
	}
}
