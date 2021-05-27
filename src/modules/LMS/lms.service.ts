import { 
	BadRequestException,
	Injectable, 
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IProduct } from '../product/interfaces/product.interface';
import { IOrder } from '../order/interfaces/order.interface';
import { filterByReference, findDuplicate, dinamicSort, onArray } from 'src/utils/helper';
import { IReview } from '../review/interfaces/review.interface';
import { expiring } from 'src/utils/order';
import { IProfile } from '../profile/interfaces/profile.interface';
import { IRating } from '../rating/interfaces/rating.interface';
import * as moment from 'moment';
import { IVideos } from '../videos/interfaces/videos.interface';
import { IComment } from '../comment/interfaces/comment.interface';
import { IShipment } from '../shipment/interfaces/shipment.interface';
import { IGeneralSettings } from '../general-settings/interfaces/general-settings.interface';
import { IBlog } from '../content/blog/interfaces/blog.interface';
import { IFulfillment } from '../content/fulfillment/interfaces/fulfillment.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class LMSService {
    constructor(
		@InjectModel('Blog') private readonly blogModel: Model<IBlog>,
		@InjectModel('Fulfillment') private readonly fulfillmentModel: Model<IFulfillment>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Order') private readonly orderModel: Model<IOrder>,
		@InjectModel('Profile') private readonly profileModel: Model<IProfile>,
		@InjectModel('Review') private readonly reviewModel: Model<IReview>,
		@InjectModel('Rating') private readonly ratingModel: Model<IRating>,
		@InjectModel('Comment') private readonly commentModel: Model<IComment>,
		@InjectModel('Shipment') private readonly shipmentModel: Model<IShipment>,
		@InjectModel('Video') private readonly videoModel: Model<IVideos>,
		@InjectModel('GeneralSetting') private readonly generalModel: Model<IGeneralSettings>,
	) {}

	private async reviewByProduct(limit?: number | 10) {
		var preview = await this.commentModel.aggregate([
			{$match: { product: { $nin: [null] } }},
			{$group: { 
				_id: "$product",
				count: { $sum: 1 }
			}},
			{$sort: { count: -1 }},
			{$limit: limit}
		])

		// console.log('preview', preview)

		if(preview.length == 0){
			preview = await this.reviewModel.aggregate([
				{$match: { product: { $nin: [null] } }},
				{$group: { 
					_id: "$product",
					count: { $sum: 1 }
				}},
				{$sort: { count: -1 }},
				{$limit: limit}
			])
		}
		
		return preview.map(el => el._id)
	}

	private async idFavoriteProduct(limit:number) {
		const order = await this.orderModel.aggregate([
			{$match: {
				status: "PAID",
			}},
			{$unwind: "$items" },
			{$group: { 
				_id: "$items.product_info",
				count: { $sum: 1 }
			}},
			{$sort: { count: -1 }},
			{$limit: limit}
		])
		
		return order.map(el => el._id)
	}

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
			el.items.forEach(res => {
				products.push({
					product: res.product_info._id,
					invoice_number: el.invoice,
					expiry_date: expiring(res.product_info.time_period * 30)
				})
			});

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

		const profileClassString = profile.class.map(res => {
			var el = res.toObject()
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

		const arrayOfProductId = profile.class.map(el=>el.product._id)

		var match:any = { _id: { $in: arrayOfProductId } }
		var filter:any = { product: { $in: arrayOfProductId } }

		if(topic){
			if(topic instanceof Array){
				topic = topic.map(t => ObjectId(t))
			}else{
				topic = [ObjectId(topic)]
			}
		}

		if(topic){
			match = { ...match, topic: { $in: topic } }
			filter = match
		}

		// on best seller / trending
		if(trending === true || trending === 'true'){
			const trendID = await this.reviewByProduct(7)

			const productID = onArray(trendID, arrayOfProductId, true)

			match = { _id: {$in: productID}}
			filter = { product: {$in: productID} }
		}

		// on user favorite
		if(favorite === true || favorite === 'true'){
			const favoriteID = await this.idFavoriteProduct(7)

			const productID = onArray(favoriteID, arrayOfProductId, true)

			match = { _id: { $in: productID } }
			filter = { product: {$in: productID} }
		}

		const searchKeysOfProducts = [
			"name", "description", "headline"
		]

		const searchKeysOfContents = [
			"title", "desc", "goal"
		]
		
		const matchTheSearch = (element: any, isProduct: boolean) => {
			if(isProduct == true){
				return searchKeysOfProducts.map(key => {
					return {[key]: {$regex: ".*" + element + ".*", $options: "i"}}
				})
			}else{
				return searchKeysOfContents.map(key => {
					return {[key]: {$regex: ".*" + element + ".*", $options: "i"}}
				})
			}
		}
		
		if(search){
			const searching = search.replace("%20", " ")
			match = { ...match, $or: matchTheSearch(searching, true) }
			filter = { ...filter, $or: matchTheSearch(searching, false) }
		}

		const productList = await this.productModel.find(match).select(['_id', 'name', 'slug', 'type', 'description', 'image_url']).then(res => {
			return res.map((res:any)=>{
				
				var el = res.toObject()
				const random = Math.floor(Math.random() * el.image_url.length);
				el.image_url = el.image_url.length > 0 ? el.image_url[random] : ''
	
				return el
			})
		})

		const content:any = await this.fulfillmentModel.find(filter)
			.populate('product', ['_id', 'name', 'slug'])
			.populate('module.author', ['_id', 'name'])
			.populate('post.author', ['_id' ,'name'])
			.populate('post.video', ['_id', 'title', 'url'])
			.populate('post.webinar')
					
		//const profileInProgress = profile.class.filter(el => el.progress != Number(100))
		var productInProgress = [];
		profile.class.forEach(res => {
			var el = res.toObject()

			if(el.progress < 100){
				const random = Math.floor(Math.random() * el['product']['image_url'].length);

				delete el.invoice_number
				delete el.add_date
				delete el.expiry_date
				delete el._id
				el.product._id = el.product._id.toString(),
				el.product.image_url = el.product.image_url.length > 0 ? el.product.image_url[random] : ''

				el.rank = {
					icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
					level: 'Dummy Level (Super Start Member)',
					total_point: 211
				}

				productInProgress.push(el)
			}
		})

		console.log('productInProgress', productInProgress)

		const allContent = await this.fulfillmentModel.find()
		
		var allModule = []
		var allWebinar = []
		var allVideo = []
		var allTips = []

		allContent.forEach(el => {
			if(el.module && el.module.statement && el.module.statement.length > 0){
				allModule.push(el.module.statement)
			}

			if(el.module && el.module.question && el.module.question.length > 0){
				allModule.push(el.module.question)
			}

			if(el.module && el.module.mission && el.module.mission.length > 0){
				allModule.push(el.module.mission)
			}

			if(el.module && el.module.mind_map && el.module.mind_map.length > 0){
				allModule.push(el.module.mind_map)
			}

			if(el.post && el.post.length > 0){
				el.post.forEach(val => {
					if(val.post_type == 'webinar' && val.webinar){
						allWebinar.push(val.webinar)
					}

					if(val.post_type == 'video' && val.video){
						allVideo.push(val.video)
					}

					if(val.post_type == 'tips' && val.tips){
						allTips.push(val.tips)
					}
				})
			}
		});

		var module = []
		var story = []
		var carouselVideo = []
		var ffContent = []
		var webinar = []
		var video = []
		var tips = []

		if(content.length > 0){
			content.forEach(res => {
				var el = res.toObject()

				if(el.module && el.module.statement && el.module.statement.length > 0){
					module.push(el.module.statement)
				}

				if(el.module && el.module.question && el.module.question.length > 0){
					module.push(el.module.question)
				}

				if(el.module && el.module.mission && el.module.mission.length > 0){
					module.push(el.module.mission)
				}

				if(el.module && el.module.mind_map && el.module.mind_map.length > 0){
					module.push(el.module.mind_map)
				}

				if(el.post && el.post.length > 0){
					el.post.forEach(val => {
						const contentList = {
							_id: val._id,
							post_type: val.post_type,
							title: val.title,
							desc: val.desc,
							images: el.images,
							product_slug: el.product.slug,
							author: val.author ? val.author.name : 'Admin',
							created_at: val.created_at
						}

						ffContent.push(contentList)

						if(val.placement && val.placement == 'stories'){
							const stories = {
								img: val.images,
								author: val.author.name
							}

							story.push(stories)
						}

						if(val.video){
							carouselVideo.push(val.video)
							if(val.post_type == 'video'){
								video.push(val.video)
							}
						}

						if(val.post_type == webinar && val.webinar){
							webinar.push(val.webinar)
						}

						if(val.post_type == 'tips' && val.tips){
							tips.push(val.tips)
						}
					})
				}
			})
		}

		return {
			stories: story,
			carousel_video: carouselVideo,
			content: ffContent,
			products: productList,
			productInProgress: productInProgress,
			webinar: {
				total: allWebinar.length,
				follow: webinar.length
			},
			video: {
				total: allVideo.length,
				follow:video.length
			},
			tips: {
				total: allTips.length,
				follow: tips.length
			},
			module: {
				total: allModule.length,
				follow: module.length
			}
		} 
    }

	private async getContent(product_slug: string, post_type?: string, video_id?: string) {
		const product = await this.productModel.findOne({slug: product_slug})
		.select(['_id', 'name', 'type', 'description', 'created_by', 'image_url'])

		if(!product) throw new NotFoundException('product not found');

		var filter:any = { product: product._id }

		var content:any = await this.fulfillmentModel.find(filter)
		.populate({
			path: 'post.video',
			populate: [{
				path: 'created_by',
				select: ['_id', 'name']
			},{
				path: 'viewer.user', 
				select: ['_id', 'name']
			}, {
				path: 'likes.user', 
				select: ['_id', 'name']
			},{
				path: 'shared.user', 
				select: ['_id', 'name']
			}],
			select:['_id', 'title', 'url', 'comments', 'viewer._id', 'viewer.user', 'viewer.on_datetime', 'likes._id', 'likes.user', 'likes.on_datetime', 'shared._id', 'shared.user', 'shared.on_datetime', 'created_by', 'created_at']
		})
		.populate({
			path: 'post.webinar',
			populate: [{
				path: 'created_by',
				select: ['_id', 'name']
			},{
				path: 'viewer.user', 
				select: ['_id', 'name']
			}, {
				path: 'likes.user', 
				select: ['_id', 'name']
			},{
				path: 'shared.user', 
				select: ['_id', 'name']
			}],
			select:['_id', 'title', 'url', 'platform', 'comments', 'viewer._id', 'viewer.user', 'viewer.on_datetime', 'likes._id', 'likes.user', 'likes.on_datetime', 'shared._id', 'shared.user', 'shared.on_datetime', 'created_by', 'created_at', 'start_datetime', 'duration']
		})
		.select(['goal', 'thanks', 'module', 'post', 'created_at', 'product'])
		.then((res:any) => Promise.all(res.map(async(el) => {
			var val = el.toObject()
			val.comments = await this.commentModel.find({ content: val._id })
			return val
		})))

		if(content.length == 0) throw new NotFoundException('content not available')
		var webinar = []
		var videos = []
		var tips = []
		var vThanks = []
		var actionModule = []
		var questionModule = []
		var missionModule = []
		var mindmapModule = []

		content.forEach(el => {
			//el = el.toObject()

			if(el.post && el.post.length > 0){
				el.post.forEach((val, index) => {
					console.log('index', index)
					if(val.post_type == 'webinar' && val.webinar){
						const now = new Date().getTime()
						const endTime = val.webinar.start_datetime.getTime() + (val.webinar.duration * 60)

						val.webinar.thumbnail = val.images,
						val.webinar.participant = val.webinar.viewer.length | 0,
						val.webinar.total_comment = val.webinar.comments.length | 0,
						val.webinar.point = 4,
						val.webinar.isLive = endTime > now ? true : false

						if(index == 0) webinar.push(val.webinar);
					}

					if(val.post_type == 'video' && val.video){
						
						val.video.thumbnail = val.images,
						val.video.participant = val.video.viewer.length | 0,
						val.video.total_comment = val.video.comments.length | 0
						val.video.point = 3

						if(index == 0) videos.push(val.video);
					}

					if(val.post_type == 'tips' && val.tips){
						const tipsData = {
							title: val.title,
							images: val.images,
							tip: val.tips,
							point: 2,
							read_by: {
								_id: '5f9f7296d4148a070021a423',
								name: 'Dummy User',
								avatar: 'https://gravatar.com/avatar/29a1df4646cb3417c19994a59a3e022a?d=mm&r=pg&s=200',
								created_at: '2021-04-27T11:51:56.832+00:00'
							}
						}
						tips.push(tipsData)
					}

				})
			}

			if(el.thanks && el.thanks.video){
				vThanks.push(el.thanks.video)
			}

			if(el.module && el.module.statement && el.module.statement.length > 0){
				actionModule.push(el.module.statement)
			}

			if(el.module && el.module.question && el.module.question.length > 0){
				questionModule.push(el.module.question)
			}

			if(el.module && el.module.mission && el.module.mission.length > 0){
				missionModule.push(el.module.mission)
			}

			if(el.module && el.module.mind_map && el.module.mind_map.length > 0){
				mindmapModule.push(el.module.mind_map)
			}

		})

		const webinarStatus = webinar.length > 0 ? true : false;
		const videoStatus = videos.length > 0 ? true : false;
		const tipsStatus = tips.length > 0 ? true : false;
				
		const randThank = Math.floor(Math.random() * vThanks.length);

		const moduleStatus = questionModule.length == 0 && missionModule.length == 0 && missionModule.length == 0 && mindmapModule.length == 0 ? false : true

		const menubar = {
			product_slug: product_slug, 
			home: true,
			webinar: webinarStatus,
			video: videoStatus,
			tips: tipsStatus,
			module: moduleStatus
		}

		const thanks = vThanks[randThank]

		questionModule.map(el => {
			el.answered = false
			return el
		})

		missionModule.map(el => {
			el.completed = false
			return el
		})

		const module = { actionModule, questionModule, missionModule, mindmapModule }

		const moduleMenu = {
			action: actionModule.length == 0 ? false : true,
			question: questionModule.length == 0 ? false : true,
			mission: missionModule.length == 0 ? false : true,
			mindmap: mindmapModule.length == 0 ? false : true
		}

		return { menubar, content, webinar, videos, tips, thanks, module, moduleMenu, product }
	}

    async home(product_slug: string, user:any) {
		const contents:any = await this.getContent(product_slug)
		const content = contents.content
		const product = contents.product

		const imgRandom = Math.floor(Math.random() * product.image_url.length);
		var goals = []
		content.forEach(el => {
			if(el.goal){
				goals.push(el.goal)
			}
		});
		const goalRandom = Math.floor(Math.random() * goals.length);

		const weeklyRanking = [
			{
				rank: 1,
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Legend Start Member)',
				total_point: 678,
				user: {
					_id: '5fbc887ce06bef072028204a',
					name: 'John Doe'
				}
			},
			{
				rank: 2,
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Super Start Member)',
				total_point: 432,
				user: {
					_id: '5fbc887ce06bef072028204b',
					name: 'Captain America'
				}
			},
			{
				rank: 3,
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Special Start Member)',
				total_point: 213,
				user: {
					_id: '5fbc887ce06bef072028204c',
					name: 'Hulk'
				}
			},
			{
				rank: 4,
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Medium Start Member)',
				total_point: 121,
				user: {
					_id: '5fbc887ce06bef072028204d',
					name: 'Sung Jin Woo'
				}
			},
			{
				rank: 5,
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Start Member)',
				total_point: 99,
				user: {
					_id: '5fbc887ce06bef072028204e',
					name: 'Balmond'
				}
			},
			{
				rank: 5,
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Basic Member)',
				total_point: 70,
				user: {
					_id: '5fbc887ce06bef072028204f',
					name: 'Zilong'
				}
			},
			{
				rank: 7,
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Member)',
				total_point: 80,
				user: {
					_id: '5fbc887ce06bef072028204g',
					name: 'Tom'
				}
			}
		]

		return {
			available_menu: contents.menubar,
			video_thanks: contents.thanks,
			image_display: product.image_url[imgRandom],
			created_by: product.created_by,
			title: product.name,
			goal: goals[goalRandom],
			description: product.desc,
			rating: await this.ratingModel.find({ kind_id: product._id }).select(['_id', 'user_id', 'rate']),
			review: await this.reviewModel.find({ product: product._id }).select(['_id', 'user', 'opini']),
			weekly_ranking: weeklyRanking,
			my_ranking: {
				rank: 21,
				icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
				level: 'Dummy Level (Member)',
				total_point: 43,
				user: {
					_id: user._id,
					name: user.name
				}
			}
		}
    }

	async webinar(product_slug: string, userID: string) {
		const contents:any = await this.getContent(product_slug, 'webinar')

		var webinar:any = contents.webinar
		
		var nextVideos = []

		if(webinar.length > 0){
			webinar = webinar.map(res => {
				delete res.comments
				delete res.likes
				delete res.shared

				if(new Date(res.start_datetime).getTime() > new Date().getTime()) nextVideos.push(res);

				return res
			});
		}

		const favProduct = await this.idFavoriteProduct(10)
		var product:any = await this.productModel.find({_id: { $in: favProduct }})
		.select(['_id', 'name', 'price', 'sale_price', 'image_url'])

		const recommendProduct = product.map(val => {
			
			var el = val.toObject()
			const imgRandom = Math.floor(Math.random() * el.image_url.length);
			const discount = el.price == 0 ? 100 : (el.sale_price == 0 ? 0 : Math.floor((el.price - el.sale_price) / el.price * 100))
			el.image_url = el.image_url[imgRandom]
			el.discount = discount + '%'

			return el
		})

		const closestVideo = webinar.sort((a, b) => {
			return Math.abs(new Date().getTime() - a) - Math.abs(new Date().getTime() - b);
		})
		const closest = closestVideo.length == 0 ? {} : closestVideo[0]
		
		return {
			available_menu: contents.menubar,
			video_thanks: contents.thanks,
			closest_schedule_video: closest,
			previous_video: webinar,
			other_video: closest._id ? nextVideos.filter(el => el._id != closest._id) : [],
			recommend_product: recommendProduct
		}
	}

	async videoList(product_slug: string, userID: string, opt?: any){
		const contents = await this.getContent(product_slug, 'video')
		var videos:any = contents.videos.map(el => {
			el.isWatched = el.viewer.find(res => res.user._id.toString() == userID) ? true : false
			delete el.viewer
			delete el.comments
			delete el.likes
			delete el.shared

			delete el.participant
			delete el.total_comment
			delete el.point

			return el
		})

		if(opt.latest == true || opt.latest == 'true'){
			videos = videos.sort(dinamicSort('created_at', 'desc'))
		}

		if(opt.recommendation == true || opt.recommendation == 'true') {
			videos = videos.sort(dinamicSort('total_comment', 'desc'))
		}

		if(opt.watched == true || opt.watched == 'true') {
			videos = videos.filter(el => el.isWatched == true)
		}

		return {
			available_menu: contents.menubar,
			videos: videos
		}
	}

	async videoDetail(product_slug: string, video_id: string) {
		const contents = await this.getContent(product_slug, 'video', video_id)
		const video = await this.videoModel.findById(video_id)
		.populate('created_by', ['_id', 'name'])
        .populate('viewer.user', ['_id', 'name'])
        .populate('likes.user', ['_id', 'name'])
        .populate('shared.user', ['_id', 'name'])
        .select(['_id', 'url', 'likes', 'viewer', 'shared', 'created_at', 'created_by'])
		
		const videoList = contents.videos.length > 0 ? contents.videos.map(val => {
			delete val.comments
			delete val.viewer
			delete val.likes
			delete val.shared
			delete val.participant
			delete val.total_comment
			delete val.point
			delete val.isActive

			val.isActive = (val._id.toString() == video_id) ? true : false;

			return val
		}) : []

		return {
			available_menu: contents.menubar,
			video_active: video,
			video_list: videoList
		}
	}

	async tipsList(product_slug: string, userID: string, opt?: any){
		const contents = await this.getContent(product_slug, 'tips')
		var tips = contents.tips

		if(opt.latest == true || opt.latest == 'true'){
			tips = tips.sort(dinamicSort('created_at', 'desc'))
		}

		if(opt.recommendation == true || opt.recommendation == 'true') {
			tips = tips.sort(dinamicSort('total_comment', 'desc'))
		}

		if(opt.watched == true || opt.watched == 'true') {
			tips = tips.filter(el => el.read_by._id == userID)
		}
	
		const productID = tips.map(el => el.product)
		const order = await this.orderModel.aggregate([
			{ $match: {user_info: userID, 'items.product_info': productID, status: 'PAID'} },
			// { $unwind: "$items" },
			// { $group: { 
			// 	_id: "$items.product_info",
			// 	count: { $sum: 1 }
			// } },
			{ $sort: { count: -1 } },
		])

		var shipmentID = []
		order.forEach(el => {
			if(el.shipment && el.shipment.shipment_info){
				shipmentID.push(el.shipment.shipment_info)
			}
		});
		
		const shipments = await this.shipmentModel.find({ _id: { $in: shipmentID } })
		.then(res => res.map(val => {
			const shipment = {
				shipping_address: val.to.address,
				image: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/ian-valerio-cafq0pv9hjy-unsplash.jpg',
				status: 'on_delivery'
			}

			return shipment
		}))

		return {
			video_thanks: contents.thanks,
			available_menu: contents.menubar,
			shipment_tracking: shipments,
			tips_list: tips
		}
	}

	async tipsDetail(id: string, user?:any, product_slug?: string): Promise<any> {
		const contents = await this.getContent(product_slug, 'tips')

		var tips:any = await this.fulfillmentModel.findById(id)
		.select(['_id', 'post.title', 'post.images', 'post.tips', 'created_at', 'author'])
		if(!tips) throw new NotFoundException('tips not found')

		var blogs:any = await this.blogModel.find()
		.populate('author', ['_id', 'name'])
		.select(['_id', 'title', 'images', 'desc', 'created_at', 'author'])

		var spotlightContent:any = contents.content.filter(el => el.placement == 'spotlight')
		if(spotlightContent.length > 0){
			spotlightContent = spotlightContent.map(val => {
				const randImg = Math.floor(Math.random() * val.images.length);
				val.image = val.images[randImg]
	
				delete val.comments
				delete val.images
				delete val.video
				delete val.product
				delete val.module
				delete val.thanks
				delete val.post_type
				delete val.placement
				delete val.goal
	
				return val
			})
		}
		const spotlightRandom = Math.floor(Math.random() * spotlightContent.length)

		const blogsContent = blogs.length == 0 ? [] : blogs.map(el => {
			var val = el.toObject()
			const imgRandom = Math.floor(Math.random() * val.images.length);
			val.image = val.images[imgRandom]
			delete val.images
			return val
		})

		return {
			available_menu: contents.menubar,
			tips: tips,
			spotlight: spotlightContent.length == 0 ? {} : spotlightContent[spotlightRandom],
			blogs: blogsContent
		}
	}

	async module(product_slug: string, sub: string) {
		const contents = await this.getContent(product_slug)
		const module = contents.module
		const moduleMenu = contents.moduleMenu
		const imgModule = await this.generalModel.findOne().select('image_module')

		const key = sub + '_module';
		const value = sub + 'Module';

		return {
			video_thanks: contents.thanks,
			available_menu: contents.menubar,
			image_module: imgModule ? imgModule.image_module : '',
			available_module_menu: moduleMenu,
			[key]: module[value]
		}
	}

	async answerTheModule(userID: string, product_slug: string, id: string, input: any) {
		input.user = userID
		input.datetime = new Date()

		const product = await this.productModel.findOne({ slug: product_slug })
		if(!product) throw new NotFoundException('product not found');

		var content:any = await this.fulfillmentModel.findOne({"module.question._id": id})
		if(!content) throw new NotFoundException(`content with question id ${id} not found`);

		const questions = content.module.question.filter(val => val._id.toString() == id)

		if(questions.length != 0){
			const answered = questions[0].answers.filter(el => el.user.toString() == userID)
			if(answered.length == 0){
				await this.fulfillmentModel.findOneAndUpdate(
					{ "module.question._id": id },
					{ $push: {
						'module.question.$.answers': input
					} }
				)
			}
		}

		// return `successfully gave the answer '${input.answer}' to the question '${question[0].value}'`
		return input
	}

	async claimMission(userID: string, product_slug: string, id: string) {
		const body = {
			user: userID,
			datetime: new Date()
		}

		const product = await this.productModel.findOne({ slug: product_slug })
		if(!product) throw new NotFoundException('product not found');

		var content:any = await this.fulfillmentModel.findOne({"module.mission._id": id})
		if(!content) throw new NotFoundException(`content with mission id ${id} not found`);

		const missions = content.module.mission.filter(val => val._id.toString() == id)

		if(missions.length != 0){
			const answered = missions[0].completed.filter(el => el.user.toString() == userID)
			if(answered.length == 0){
				await this.fulfillmentModel.findOneAndUpdate(
					{ "module.mission._id": id },
					{ $push: {
						'module.mission.$.completed': body
					} }
				)
			}
		}

		return body
	}
}
