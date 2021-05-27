import {
	Injectable,
	NotFoundException,
	NotImplementedException
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IProduct } from '../interfaces/product.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { IOrder } from 'src/modules/order/interfaces/order.interface';
import { ICoupon } from 'src/modules/coupon/interfaces/coupon.interface';
import { IContent } from 'src/modules/content/interfaces/content.interface';
import { StrToUnix } from 'src/utils/StringManipulation';
import { findDuplicate, groupBy, objToArray } from 'src/utils/helper';
import { IComment } from 'src/modules/comment/interfaces/comment.interface';
import { IRating } from 'src/modules/rating/interfaces/rating.interface';
import { IReview } from 'src/modules/review/interfaces/review.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ProductCrudService {

	constructor(
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Order') private orderModel: Model<IOrder>,
		@InjectModel('Coupon') private couponModel: Model<ICoupon>,
		@InjectModel('Content') private contentModel: Model<IContent>,
		@InjectModel('Comment') private commentModel: Model<IComment>,
		@InjectModel('Rating') private ratingModel: Model<IRating>,
		@InjectModel('Review') private reviewModel: Model<IReview>,
    ) {}
    
    async findAll(options: OptQuery) {
		const {
			offset,
			limit,
			sortby,
			sortval,
			fields,
			value,
			optFields,
			optVal
		} = options;

		const limits = Number(limit)
		const offsets = Number(offset == 0 ? offset : (offset - 1))
		const skip = offsets * limits
		const sortvals = (sortval == 'asc') ? 1 : -1
		var query: any
		var sort: object = {}
		var match: object = { [fields]: value }
		

		if(optFields){
			if(!fields){
				match = { [optFields]: optVal }
			}
			match = { [fields]: value, [optFields]: optVal }
		}
		
		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { 'updated_at': 'desc' }
		}

		query = await this.productModel.find(match).skip(skip).limit(limits).sort(sort)
		.populate({
			path: 'created_by',
			select: {_id:1, name:1, phone_number:1}
		})
		.populate({
			path: 'updated_by',
			select: {_id:1, name:1, phone_number:1}
		})
		.populate({
			path: 'topic',
			select: {_id:1, name:1, phone_number:1}
		})
		.populate({
			path: 'agent',
			select: {_id:1, name:1, phone_number:1}
		})
		.populate({
			path: 'tag',
			select: {_id:1, name:1}
		})

		return query
	}

	async findById(id: string): Promise<IProduct> {
	 	let query:any
		try{
			query = await this.productModel.findOne({ _id: id })
		}catch(error){
		    throw new NotFoundException(`Could nod find product with id ${id}`)
		}

		if(!query){
			throw new NotFoundException(`Could nod find product with id ${id}`)
		}

		var result = query.toObject()
		result.rating = await this.ratingModel.find({ kind_id: id }).select(['_id', 'user_id', 'rate'])
		result.review = await this.reviewModel.find({ product: id }).select(['_id', 'user', 'opini'])

		return result;
	}

	async findBySlug(slug: string): Promise<IProduct> {
		let result
		try{
			result = await this.productModel.findOne({slug: slug})
	   	}catch(error){
		   throw new NotFoundException(`Could nod find product with slug ${slug}`)
	   	}

	   	if(!result){
		   throw new NotFoundException(`Could nod find product with slug ${slug}`)
	   	}

	   	return result
   }

	async delete(id: string): Promise<string> {
		try{
			// await this.productModel.findByIdAndRemove(id).exec();
			await this.productModel.findByIdAndUpdate(id, { visibility: 'draft' })
			return 'ok'
		}catch(err){
			throw new NotImplementedException('The product could not be deleted')
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try {
			// await this.productModel.deleteMany({ _id: { $in: arrayId } });
			await this.productModel.updateMany({  _id: { $in: arrayId } }, { visibility: 'draft' })
			return 'ok';
		} catch (err) {
			throw new NotImplementedException('The product could not be deleted');
		}
	}

	async search(value: any): Promise<IProduct[]> {

		const result = await this.productModel.find({ $text: { $search: value.search } })

		if (!result) {
			throw new NotFoundException("Your search was not found")
		}

		return result
	}

	async insertMany(value: any, userId: any) {
		const arrayId = value.id
		const now = new Date()
		const copy = `COPY-${StrToUnix(now)}`
			
		var found = await this.productModel.find({ _id: { $in: arrayId } })
		for(let i in found){
			found[i]._id = new ObjectId()
			found[i].name = `${found[i].name}-${copy}`
			found[i].slug = `${found[i].slug}-${copy}`
			found[i].code = `${found[i].code}-${copy}`
			found[i].created_by = userId
			found[i].updated_by = null
		}
		
		try {
			return await this.productModel.insertMany(found);
		} catch (e) {
			throw new NotImplementedException(`The product could not be cloned`);
		}
	}

	async ProductCountList(options: OptQuery) {
		const {
			offset,
			limit,
			sortby,
			sortval,
			fields,
			value,
			optFields,
			optVal
		} = options;

		const limits = Number(limit)
		const offsets = Number(offset == 0 ? offset : (offset - 1))
		const skip = offsets * limits
		const sortvals = (sortval == 'asc') ? 1 : -1
		var sort: object = {}
		var match: object = { [fields]: value }

		if(optFields){
			if(!fields){
				match = { [optFields]: optVal }
			}
			match = { [fields]: value, [optFields]: optVal }
		}
		
		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { 'created': 'desc' }
		}

        var product:any = await this.productModel.find(match).skip(skip).limit(limits).sort(sort)
		.populate({
			path: 'created_by',
			select: {_id:1, name:1, phone_number:1}
		})
		.populate({
			path: 'updated_by',
			select: {_id:1, name:1, phone_number:1}
		})
		.populate({
			path: 'topic',
			select: {_id:1, name:1, phone_number:1}
		})
		.populate({
			path: 'agent',
			select: {_id:1, name:1, phone_number:1}
		})
		.populate({
			path: 'tag',
			select: {_id:1, name:1}
		})

		let response = product.map(async(res) => {
			var el = res.toObject()
			const order = await this.orderModel.find({ "items.product_info": el._id}).select(['_id', 'user_info', 'status'])
			const userKeyList = groupBy(order, 'user_info')
			const userList = objToArray(userKeyList).map((val:any) => {
				const ttlStatusOrder = (status) => val.value.filter(res => res.status == status).length
				return {
					_id: val.key, 
					total_order: val.value.length,
					total_pending_order: ttlStatusOrder('PENDING'),
					total_unpaid_order: ttlStatusOrder('UNPAID'),
					total_paid_order: ttlStatusOrder('PAID'),
					// total_expired_order: ttlStatusOrder('EXPIRED'),
				}
			})

			// const comment = await this.commentModel.find({ product: el._id }).select(['_id', 'comment', 'reactions', 'user', 'likes']).sort({created_at: -1})
			// console.log('comment', comment)
			
			// const reactions = new Array()
			// const likes = new Array()
			// comment.map(comment => {
			// 	reactions.push(...comment.reactions)
			// 	likes.push(...comment.likes)
			// })

			// el.comments = {
			// 	total_comment: comment.length,
			// 	total_reaction: reactions.length,
			// 	total_like: likes.length,
			// 	ref: comment.map(val => ({
			// 		_id: val._id, 
			// 		user_id: val.user,
			// 		comment: val.comment,
			// 		likes: val.likes
			// 	}))
			// }

			const rating = await this.ratingModel.find({kind_id: el._id}).select(['user_id', 'rate'])

			el.ratings = {
				total_rating: rating.length,
				ref: rating
			}

			el.coupon_use = {
				total_coupon: await this.couponModel.find({ "product_id": el._id}).countDocuments()
			}

			el.content_use = {
				total_content: await this.contentModel.find({ "product": el._id }).countDocuments()
			} 

			el.ordered = {
				total_order: order.length,
				ref: order
			} 

			el.buyer = {
				total_buyer: userList.length,
				ref: userList,
			}

			return el
		})

		return Promise.all(response)
	}
	
	async bestSeller() {
		const result = await this.orderModel.find().then(arr => {
			return findDuplicate(arr, 'items', 'product_info', 5).map(product => ({product_id: product.key, total: product.value}))
		})

		return result
	}
	
	async onTrending(userID: string) {
		const order = await this.orderModel.find({user_info: userID})

		if(order.length < 1){
			return null
		}
		const objCount = findDuplicate(order, 'items', 'product_info').map(product => ({product_id: product.key, total: product.value}))
		return objCount
    }

	async onPaid(userID: string, orderStatus: string): Promise<any> {
		return await this.orderModel.find({user_info: userID, status: orderStatus}).then(order => {
			var products = []
			order.forEach(element => {
				products.push(...element.items.map(el => el.product_info))
			});

			return products
		})
    }
}
