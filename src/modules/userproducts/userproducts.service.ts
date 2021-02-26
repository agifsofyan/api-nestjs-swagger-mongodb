import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IUserProducts } from './interfaces/userproducts.interface';
import { LMSQuery, OptQuery } from 'src/utils/OptQuery';
import { IProduct } from '../product/interfaces/product.interface';
import { IOrder } from '../order/interfaces/order.interface';
import { findDuplicate } from 'src/utils/helper';
import { IReview } from '../review/interfaces/review.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class UserproductsService {
    constructor(
		@InjectModel('UserProduct') private readonly userProductModel: Model<IUserProducts>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Order') private readonly orderModel: Model<IOrder>,
		@InjectModel('Review') private readonly reviewModel: Model<IReview>,
	) {}

	private async BridgeTheContent(opt: any) {
		// const objectIdValidTo = ["user_id", "topic"]

		var {
			offset,
			limit,
			sortby,
			sortval,
			topic,
			trending,
			favorite,
			done,
			placement,
			content_type,
			content_post_type,
			as_user,
			user_id,
		} = opt;

		const offsets = offset == 0 ? offset : (offset - 1)
		const skip = offsets * limit
		const sortvals = (sortval == 'asc') ? 1 : -1

		console.log('opt', opt)

		if(topic){
			if(typeof topic === 'string'){
				ObjectId(topic)
				if(!ObjectId.isValid(topic)){
					throw new BadRequestException(`topic is invalid format to ObjectID`)
				}
			}
		}

		var sort: object = {}
		
		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { expired_date: 1 }
		}
		
		var match:any = {}

		if(as_user === true || as_user === 'true'){
			match = { ...match, user_id: user_id }
		}

		if(as_user === false || as_user === 'false'){
			match = { ...match, user_id: { $nin: [user_id] } }
		}
		
        if(done === false || done === 'false'){
			match = { ...match, progress: { $lt:100 } }
        }
		
        if(done === true || done === 'true'){
			match = { ...match, progress: 100 }
        }

		if(topic){
			match = { ...match, topic: { $in: topic } }
		}

		console.log("trending", trending)

		// on best seller / trending
		if(trending === true || trending === 'true'){
			const review = await this.reviewModel.find()

			if(review.length > 0){
				const productInReview = review.map(val => val.product)
				const trendOnUser = await this.orderModel.find({
					status: "PAID", "items.product_info": { $in: productInReview }
				}).then(arr => {
					return findDuplicate(arr, 'items', 'product_info').map(product => ObjectId(product.key))
				})
	
				match = {
					...match,
					product_id: {$in: trendOnUser}
				}
			}
		}

		// on user favorite
		if(favorite === true || favorite === 'true'){
			const favoriteOnUser = await this.orderModel.find({status: "PAID"}).then(arr => {
				return findDuplicate(arr, 'items', 'product_info').map(product => ObjectId(product.key))
			})

			match = {
				...match,
				product_id: { $in: favoriteOnUser }
			}
		}

		if(placement){
			match = { ...match, placement: placement }
		}

		if(content_type){
			match = { ...match, content_type: content_type }
		}

		if(content_post_type){
			match = { ...match, content_kind: content_post_type }
		}
		
		console.log('match', match)

		const query = await this.userProductModel.aggregate([
			{$match: match},
			{$lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
			}},
			{$unwind: {
					path: '$user',
					preserveNullAndEmptyArrays: true
			}},
			{$lookup: {
					from: 'products',
					localField: 'product_id',
					foreignField: '_id',
					as: 'product'
			}},
			{$unwind: {
					path: '$product',
					preserveNullAndEmptyArrays: true
			}},
			{$lookup: {
					from: 'contents',
					localField: 'content_id',
					foreignField: '_id',
					as: 'content'
			}},
			{$unwind: {
					path: '$content',
					preserveNullAndEmptyArrays: true
			}},
			{$lookup: {
					from: 'topics',
					localField: 'topic',
					foreignField: '_id',
					as: 'topic'
			}},
			{$lookup: {
					from: 'orders',
					localField: 'order_invoice',
					foreignField: 'invoice',
					as: 'order'
			}},
			{$unwind: {
				path: '$order',
				preserveNullAndEmptyArrays: true
			}},
			{$project: {
				"user._id":1,
				"user.name":1,
				"user.email":1,
				"user.phone_number":1,
				"product._id":1,
				"product.name":1,
				"product.slug":1,
				"product.code":1,
				"product.type":1,
				"product.visibility":1,
				"product.time_period":1,
				"utm":1,
				"content.title":1,
				"content.desc":1,
				"content.images":1,
				"content.podcast":1,
				"content.video":1,
				"content.thanks":1,
				"content.placement":1,
				"content.isBlog":1,
				"content.post_type":1,
				"content.series":1,
				"content.module":1,
				"topic._id":1,
				"topic.name":1,
				"topic.icon":1,
				"order.invoice":1,
				"order.payment":1,
				"progress": 1,
				"expired_date": 1,
				"created_at": 1
			}},
			{$addFields: {
				"content.type": { $cond: {
					if: { $eq: ["$content.isBlog", true] },
					then: "blog",
					else: "fulfilment"
				}}
			}},
			{$limit: !limit ? await this.userProductModel.countDocuments() : Number(limit)},
			{$skip: Number(skip)},
			{$sort:sort}
		])

		return query
	}

    async LMS_list(userId: string, options: LMSQuery){

		var opt:any = options
		opt.user_id = userId

        const query = this.BridgeTheContent(opt)
        return query
    }

    async userProductDetail(userId: string, product_id: string) {
        const query = await this.userProductModel.findOne({user: userId, product: product_id})

        const product = await this.productModel.findOne({_id: product_id})

        if(!query || !product){
            throw new NotFoundException('product not found')
        }

        return product
    }

    async sendProgress(id: string, progress: number) {
		try {
			await this.productModel.findById(id)
		} catch (error) {
			throw new BadRequestException(`content with id ${id} not found`)
		}

		await this.productModel.findOneAndUpdate({_id: id}, {progress: progress})
		return `successfully changed the progress to ${progress}%`
	}
}
