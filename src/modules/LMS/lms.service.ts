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
import { CommentService } from '../comment/comment.service';
import { VideosService } from '../videos/videos.service';
import { expiring } from 'src/utils/order';
import { IProfile } from '../profile/interfaces/profile.interface';

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
		private commentService: CommentService,
		private videoService: VideosService,
	) {}

    async list(userID: any, opt: any){

		var {
			topic,
			trending,
			favorite,
			search
		} = opt;

		var match:any = {}
		var filter = false

		if(topic){
			filter = true
			if(topic instanceof Array){
				topic = topic.map(t => ObjectId(t))
			}else{
				topic = [ObjectId(topic)]
			}
		}

		if(topic){
			filter = true
			match = { topic: { $in: topic } }
		}

		// on best seller / trending
		if(trending === true || trending === 'true'){
			filter = true
			const review = await this.reviewModel.find()

			if(review.length > 0){
				const productInReview = review.map(val => val.product)
				const trendOnUser = await this.orderModel.find({
					status: "PAID", "items.product_info": { $in: productInReview }
				}).then(arr => {
					return findDuplicate(arr, 'items', 'product_info').map(product => ObjectId(product.key))
				})
	
				match = {
					_id: {$in: trendOnUser}
				}
			}
		}

		// on user favorite
		// if(favorite === true || favorite === 'true'){
			// filter = true
			// const favoriteOnUser = await this.orderModel.find({status: "PAID"}).then(arr => {
			// 	return findDuplicate(arr, 'items', 'product_info').map(product => ObjectId(product.key))
			// })

			// match = {
			// 	_id: { $in: favoriteOnUser }
			// }
		// }

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
			match = {
				$or: matchTheSearch(searching)
			}
		}

		const trueProduct = await this.productModel.find(match).select(['_id', 'name', 'type', 'description', 'image_url'])

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

		console.log('arrayOfProductId', arrayOfProductId)

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
		
		var productList = content.map((el:any)=>{
			const random = Math.floor(Math.random() * el['product']['image_url'].length);
			el = el.toObject()
			el.product.image_url = el.product.image_url.length > 0 ? el.product.image_url[random] : []

			return el.product
		})

		if(filter == true){
			productList = trueProduct
		}

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
			
			return {
				progress: el.progress,
				...el.product
			}
		})

		// const webinarLength = await this.contentModel.find({ post_type: 'webinar' })
		// const videoLength = await this.contentModel.find({ post_type: 'video' })
		// const tipsLength = await this.contentModel.find({ post_type: 'tips' })

		// const moduleLength = await this.contentModel.find().then()

		return {
			stories: story,
			carousel_video: carouselVideo,
			products: productList,
			productInProgress: productInProgress,
			// webinar: {
			// 	total: webinarLength,
			// 	follow: content.length
			// },
			// video: {
			// 	total: videoLength,
			// 	follow: content.length
			// },
			// tips: {
			// 	total: tipsLength,
			// 	follow: content.length
			// },
			// module: {
			// 	total: tipsLength,
			// 	follow: content.length
			// }
		}
    }

    async detail(product_id: string) {
		return null
    }
}
