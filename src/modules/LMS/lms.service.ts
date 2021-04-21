import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IUserProducts } from '../userproducts/interfaces/userproducts.interface';
import { LMSQuery, OptQuery } from 'src/utils/OptQuery';
import { IProduct } from '../product/interfaces/product.interface';
import { IOrder } from '../order/interfaces/order.interface';
import { filterByReference, findDuplicate } from 'src/utils/helper';
import { IReview } from '../review/interfaces/review.interface';
import { IContent } from '../content/interfaces/content.interface';
import { expiring } from 'src/utils/order';
import { IProfile } from '../profile/interfaces/profile.interface';
import { IRating } from '../rating/interfaces/rating.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class LMSService {
    constructor(
		@InjectModel('UserProduct') private readonly userProductModel: Model<IUserProducts>,
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Order') private readonly orderModel: Model<IOrder>,
		@InjectModel('Profile') private readonly profileModel: Model<IProfile>,
		@InjectModel('Review') private readonly reviewModel: Model<IReview>,
		@InjectModel('Rating') private readonly ratingModel: Model<IRating>
	) {}

    async list(userID: any, opt: any){

		var {
			topic,
			trending,
			favorite,
			search
		} = opt;

		/**
		 * Create User Class
		 */
		var products = new Array()
		const orders = await this.orderModel.find({user_info: userID, status: 'PAID'})
		.populate({
			path: 'items.product_info',
			select: {
				_id:1,
				time_period:1,
			},
		})

		orders.forEach(el => {
			var userClass
			el.items.forEach(res => {
				userClass = {
					product: res.product_info._id,
					invoice_number: el.invoice,
					expiry_date: expiring(res.product_info.time_period)
				}
			});

			products.push(userClass)
		});
		
		const checkClass = findDuplicate(products, 'product')
		const userClass = checkClass.map(el => {
			const orderItem = products.filter(res => res.product.toString() == el.key)
			return {
				product: el.key,
				invoice_number: orderItem[Number(el.value) - 1].invoice_number,
				add_date: new Date(),
				expiry_date: orderItem[Number(el.value) - 1].expiry_date
			}
		});

		var profile:any = await this.profileModel.findOne({user: userID})

		if(!profile.class || profile.class.length == 0){
			profile.class = userClass
		}

		const profileClassString = profile.class.map(el => {
			el = el.toObject()
			el.product = el.product.toString()
			return el
		})
		
		const availableProduct = filterByReference(userClass, profileClassString, 'product', 'product', false)

		if(profile.class.length > 0){
			profile.class.push(...availableProduct)
		}

		await profile.save()

		profile = await this.profileModel.findOne({user: userID})
		.populate('class.product', ['_id', 'name', 'description', 'type', 'image_url'])

		/**
		 * End Create User Class
		 */

		//  const contentFind = async (func: any) => {
		// 	return await this.contentModel.find(func)
		// 	.populate('product', ['_id', 'name', 'description', 'type', 'image_url'])
		// 	.populate('author', ['_id', 'name'])
		// 	.populate('video', ['_id', 'title', 'url'])
		// }

		const arrayOfProductId = profile.class.map(el=>el.product._id)

		var match:any = { _id: { $in: arrayOfProductId } }

		if(topic){
			if(topic instanceof Array){
				topic = topic.map(t => ObjectId(t))
			}else{
				topic = [ObjectId(topic)]
			}
		}

		if(topic){
			match = { ...match, topic: { $in: topic } }
		}

		// on best seller / trending
		if(trending === true || trending === 'true'){
			const review = await this.reviewModel.find()

			if(review.length > 0){
				const productInReview = review.map(val => val.product)
				const trendOnUser = await this.orderModel.find({
					status: "PAID", "items.product_info": { $in: productInReview }
				}).then(arr => {
					return findDuplicate(arr, 'items', 'product_info', 7).map(product => ObjectId(product.key))
				})
	
				match = { _id: {$in: trendOnUser}}
			}
		}

		// on user favorite
		if(favorite === true || favorite === 'true'){
			const favoriteOnUser = await this.orderModel.find({status: "PAID"}).then(arr => {
				return findDuplicate(arr, 'items', 'product_info', 7).map(product => ObjectId(product.key))
			})

			match = { _id: { $in: favoriteOnUser } }
		}

		const searchKeys = [
			"name", "description", "headline"
		]
		
		const matchTheSearch = (element: any) => {
			return searchKeys.map(key => {
				return {[key]: {$regex: ".*" + element + ".*", $options: "i"}}
			})
		}
		
		if(search){
			const searching = search.replace("%20", " ")
			match = { ...match, $or: matchTheSearch(searching) }
		}

		const productList = await this.productModel.find(match).select(['_id', 'name', 'type', 'description', 'image_url']).then(res => {
			return res.map((el:any)=>{
				const random = Math.floor(Math.random() * el.image_url.length);
				el = el.toObject()
				el.image_url = el.image_url.length > 0 ? el.image_url[random] : []
	
				return el
			})
		})

		const content = await this.contentModel.find({ product: { $in: arrayOfProductId } })
			.populate('product', ['_id', 'name', 'description', 'type', 'image_url'])
			.populate('author', ['_id', 'name'])
			.populate('video', ['_id', 'title', 'url'])
		
		const story = content.filter(el=>el.placement=='stories').map(res=> {
			const random = Math.floor(Math.random() * res.images.length);
			return {
				img: res.images.length > 0 ? res.images[random] : [],
				author: res.author.name
			}
		})

		const carouselVideo = content.map(el=>{
			const random = Math.floor(Math.random() * el.video.length);
			return el.video.length > 0 ? el.video[random] : []
		})

		const profileInProgress = profile.class.filter(el=>el.progress < 100)

		const productInProgress = profileInProgress.map(el => {
			el = el.toObject()
			delete el.invoice_number
			delete el.add_date
			delete el.expiry_date
			delete el._id
			el.product._id = el.product._id.toString()

			const random = Math.floor(Math.random() * el['product']['image_url'].length);
			el.product.image_url = el.product.image_url.length > 0 ? el.product.image_url[random] : []

			el.rank = {
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Super Start Member)',
				total_point: 211
			}
			
			return {
				progress: el.progress,
				...el.product
			}
		})

		const allContent = await this.contentModel.find()
		const webinar = allContent.filter(el => el.post_type == 'webinar')
		const video = allContent.filter(el => el.post_type == 'video')
		const tips = allContent.filter(el => el.post_type == 'tips')
		const module = allContent.filter(el => el.module && el.module.mission.length > 0)

		return {
			stories: story,
			carousel_video: carouselVideo,
			products: productList,
			productInProgress: productInProgress,
			webinar: {
				total: webinar.length,
				follow: content.filter(el => el.post_type == 'webinar').length
			},
			video: {
				total: video.length,
				follow:content.filter(el => el.post_type == 'video').length
			},
			tips: {
				total: tips.length,
				follow: content.filter(el => el.post_type == 'tips').length
			},
			module: {
				total: module.length,
				follow: content.filter(el => el.module && el.module.mission.length > 0).length
			}
		}
    }

    async detail(product_id: string) {
		var query:any = await this.productModel.findOne({_id: product_id})
		.select(['_id', 'name', 'slug', 'type', 'headline', 'description', 'created_by', 'image_url'])

		if(!query) throw new NotFoundException('product not found');

		const content = await this.contentModel.find({ product: product_id }).select('thanks')

		var vThanks = []

		if(content.length > 0){
			content.forEach(el => {
				vThanks.push(el.thanks.video)
			});
		}

		const imgRandom = Math.floor(Math.random() * query.image_url.length);
		const vidRandom = Math.floor(Math.random() * vThanks.length);

		query = query.toObject()

		query.goal = 'Dummy Goal Of Product';

		const weeklyRanking = [
			{
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Legend Start Member)',
				total_point: 678
			},
			{
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Super Start Member)',
				total_point: 432
			},
			{
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Special Start Member)',
				total_point: 213
			},
			{
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Medium Start Member)',
				total_point: 121
			},
			{
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Start Member)',
				total_point: 99
			}
		]

		return {
			video_thanks: vThanks[vidRandom],
			image_display: query.image_url[imgRandom],
			product: query,
			rating: await this.ratingModel.find({ kind_id: product_id }).select(['_id', 'user_id', 'rate']),
			review: await this.reviewModel.find({ product: product_id }).select(['_id', 'user', 'opini']),
			weekly_ranking: weeklyRanking
		}
    }

	async webinar(product_id: string, userID: string) {
		console.log('user', userID)
		var query:any = await this.contentModel.find({product: product_id})
		.select(['_id', 'thanks']).populate('video', ['_id', 'url', 'title', 'viewer', 'comments'])

		var vThanks = []
		var vList = []
		var pVideos = []

		if(query.length > 0){
			query.forEach(el => {
				el = el.toObject()

				vThanks.push(el.thanks.video)
				vList.push(el.video)

				el.video.forEach(res => {
					res.participant = res.viewer ? res.viewer.length : 0
					res.total_comment = res.comments ? res.comments.length : 0
					res.point = 3 // Dummy
					delete res.comments

					console.log('res.viewer', res.viewer)
					if(res.viewer && res.viewer.length > 0){
						const viewer = res.viewer.find(val => val.user == userID.toString())
						console.log('viewer', viewer)

						if(viewer){
							pVideos.push(res)
						}
					}
				});
			});
		}

		const vidRandom = Math.floor(Math.random() * vThanks.length);
		
		return {
			video_thanks: vThanks[vidRandom],
			all_video: vList,
			previous_video: pVideos,
		}
	}
}
