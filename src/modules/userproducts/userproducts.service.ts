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
import { IContent } from '../content/interfaces/content.interface';
import { IComment } from '../comment/interfaces/comment.interface';
import { CommentService } from '../comment/comment.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class UserproductsService {
    constructor(
		@InjectModel('UserProduct') private readonly userProductModel: Model<IUserProducts>,
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Order') private readonly orderModel: Model<IOrder>,
		@InjectModel('Review') private readonly reviewModel: Model<IReview>,
		// @InjectModel('Comment') private readonly commentModel: Model<IComment>,
		private commentService: CommentService,
	) {}

	private async ProjectAggregate(detail: boolean) {
		var project:any = {
			"_id":1,
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
			"content._id":1,
			"content.title":1,
			"content.desc":1,
			"content.images":1,
			"content.podcast":1,
			"content.video":1,
			"content.thanks":1,
			"content.placement":1,
			// "content.topic":1,
			// "content.isBlog":1,
			"content.post_type":1,
			"content.series":1,
			"content.module":1,
			"topic._id":1,
			"topic.name":1,
			"topic.icon":1,
			"order.invoice":1,
			"order.payment":1,
			// "content_type": 1,
			"progress": 1,
			"expired_date": 1,
			"created_at": 1
		}

		if(detail){
			project = {
				"_id":1,
				"user._id":1,
				"user.name":1,
				"user.email":1,
				"user.phone_number":1,
				"product":1,
				"utm":1,
				"content":1,
				"topic":1,
				"order.invoice":1,
				"order.payment":1,
				"progress": 1,
				"expired_date": 1,
				"created_at": 1
			}
		}

		return project
	}

	private async BridgeTheContent(opt: any, detail: boolean) {
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
			search,
			id,
		} = opt;

		const offsets = offset == 0 ? offset : (offset - 1)
		const skip = offsets * limit
		const sortvals = (sortval == 'asc') ? 1 : -1

		if(topic){
			if(topic instanceof Array){
				topic = topic.map(t => ObjectId(t))
			}else{
				topic = [ObjectId(topic)]
			}
		}

		var sort: object = {}
		
		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { expired_date: 1 }
		}
		
		var match:any = {}

		if(as_user === false || as_user === 'false'){
			match = { ...match, "user._id": { $nin: [user_id] } }
		}else{
			match = { ...match, "user._id": user_id }
		}
		
        if(done === false || done === 'false'){
			match = { ...match, progress: { $lt:100 } }
        }
		
        if(done === true || done === 'true'){
			match = { ...match, progress: 100 }
        }

		if(topic){
			match = { ...match, "topic._id": { $in: topic } }
		}

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
					"product._id": {$in: trendOnUser}
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
				"product._id": { $in: favoriteOnUser }
			}
		}

		if(placement){
			match = { ...match, "content.placement": placement }
		}

		if(content_type){
			match = { ...match, "content.type": content_type }
		}

		if(content_post_type){
			match = { ...match, "content.post_type": content_post_type }
		}

		const searchKeys = [
			"product.name", "content.title", "content.desc", "content.module.statement", "content.module.question",
			"content.module.misson", "content.module.answers.answer", 
			"topic.name"
		]
		
		const matchTheSearch = (element: any) => {
			return searchKeys.map(key => {
				return {[key]: {$regex: ".*" + element + ".*", $options: "i"}}
			})
		}
		
		if(search){
			const searching = search.replace("%20", " ")
			match = {
				// ...match,
				$or: matchTheSearch(searching)
			}
		}

		if(id){
			match = {"_id": ObjectId(id)}
		}

		const project = await this.ProjectAggregate(detail)

		const query = await this.userProductModel.aggregate([
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
			{$project: project},
			{$addFields: {
				"content.type": { $cond: {
					if: { $eq: ["$content.isBlog", true] },
					then: "blog",
					else: "fulfilment"
				}}
			}},
			{$match: match},
			{$limit: !limit ? await this.userProductModel.countDocuments() : Number(limit)},
			{$skip: Number(skip)},
			{$sort:sort}
		])

		return query
	}

    async LMS_list(user: any, options: LMSQuery){
		var opt:any = options
		opt.user_id = user._id
		
        const query:any = await this.BridgeTheContent(opt, false)

		const response = query.map(async(el) => {
			el.content.video.map(async(res) => {
				res.comments = (!res.comments || res.comments.length <= 0) ? [] : 
				await this.commentService.commentPreview(el.product._id, res._id)
				return res
			})

			el.comments = await this.commentService.commentPreview(el.product._id)
			return el
		})

		return Promise.all(response)
    }

    async detail(id: string) {
		var opt = { id: id }
		const content = await this.BridgeTheContent(opt, true)
        return content.length === 0 ? content : content[0]
    }

    async sendProgress(user: any, product_id: string, progress: number) {
		try {
			await this.userProductModel.findOne({user_id: user._id, product_id: product_id})
		} catch (error) {
			throw new NotFoundException(`LMS with product id ${product_id} and user email ${user.email} not found`)
		}

		await this.userProductModel.findOneAndUpdate(
			{user_id: user._id, product_id: product_id}, 
			{progress: progress}
		)
		return `successfully changed the progress to ${progress}%`
	}

	async sendAnswer(user: any, input: any) {
		const content = await this.contentModel.findOne({"module.question._id": input.question_id})
		if(!content){
			throw new BadRequestException(`content with question id ${input.question_id} not found`)
		}

		const contentID = content._id

		var lms = await this.userProductModel.findOne({user_id: user._id, content_id: contentID})
		
		if(!lms){
			throw new NotFoundException(`LMS with content id ${contentID} and user email ${user.email} not found`)
		}

		if(lms.modules.answers.length >= 0){
			if(lms.modules.answers.filter(val => val.question_id == input.question_id).length >= 1){
				throw new BadRequestException('you have answered this question')
			}
		}

		const question = content.module.question.filter(val => val._id == input.question_id)
		
		lms.modules.answers.push(input)
		await lms.save()

		return `successfully gave the answer '${input.answer}' to the question '${question[0].value}'`
	}

	async sendMission(user: any, input: any) {
		const content = await this.contentModel.findOne({"module.mission._id": input.mission_id})
		if(!content){
			throw new BadRequestException(`content with mission id ${input.mission_id} not found`)
		}

		const contentID = content._id

		var lms = await this.userProductModel.findOne({user_id: user._id, content_id: contentID})
		
		if(!lms){
			throw new NotFoundException(`LMS with content id ${contentID} and user email ${user.email} not found`)
		}

		if(lms.modules.mission_complete.length >= 0){
			if(lms.modules.mission_complete.filter(val => val.mission_id == input.mission_id).length >= 1){
				throw new BadRequestException('you have completed this mission')
			}
		}

		const mission = content.module.mission.filter(val => val._id == input.mission_id)
		
		lms.modules.mission_complete.push(input)
		await lms.save()

		return `successfully completed the mission '${mission[0].value}'`
	}

	async mediaList(user: any, type: string, index?: any) {
		var opt = { user_id: user._id }
        const query = await this.BridgeTheContent(opt, false)
		
		var allmedia = []
		query.forEach(val => {
			var media = val.content[type]

			if(index == true || index == 'true'){
				media = media[0]
			}

			allmedia.push(media)
			return allmedia
		})

		const mediaArray = [].concat.apply([], allmedia)

        return mediaArray
	}
}
