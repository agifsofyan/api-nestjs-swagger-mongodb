import { 
	Injectable, 
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IProduct } from '../product/interfaces/product.interface';
import { IOrder } from '../order/interfaces/order.interface';
import { filterByReference, findDuplicate, dinamicSort } from 'src/utils/helper';
import { IReview } from '../review/interfaces/review.interface';
import { IContent } from '../content/interfaces/content.interface';
import { expiring } from 'src/utils/order';
import { IProfile } from '../profile/interfaces/profile.interface';
import { IRating } from '../rating/interfaces/rating.interface';
import * as moment from 'moment';
import { IVideos } from '../videos/interfaces/videos.interface';
import { IComment } from '../comment/interfaces/comment.interface';
import { IShipment } from '../shipment/interfaces/shipment.interface';
import { IGeneralSettings } from '../general-settings/interfaces/general-settings.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class LMSService {
    constructor(
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
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
		const preview = await this.reviewModel.aggregate([
			{$group: { 
				_id: "$product",
				count: { $sum: 1 }
			}},
			{$sort: { count: -1 }},
			{$limit: limit}
		])
		
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
			const trendID = await this.reviewByProduct(7)

			const productID = arrayOfProductId.filter((el) => trendID.indexOf(el) < 0)

			match = { _id: {$in: productID}}
		}

		// on user favorite
		if(favorite === true || favorite === 'true'){
			const favoriteID = await this.idFavoriteProduct(7)
			const productID = arrayOfProductId.filter((el) => favoriteID.indexOf(el) < 0)

			match = { _id: { $in: productID } }
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

		const productList = await this.productModel.find(match).select(['_id', 'name', 'slug', 'type', 'description', 'image_url']).then(res => {
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

	private async getContent(product_slug: string, post_type?: string, video_id?: string) {
		const checkProduct = await this.productModel.findOne({slug: product_slug})
		if(!checkProduct) throw new NotFoundException('product not found');

		var filter:any = { product: checkProduct._id }

		var content:any = await this.contentModel.find(filter)
		.populate({
			path: 'video',
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
			select:['_id', 'title', 'url', 'comments', 'viewer._id', 'viewer.user', 'viewer.on_datetime', 'likes._id', 'likes.user', 'likes.on_datetime', 'shared._id', 'shared.user', 'shared.on_datetime', 'created_by', 'created_at', 'isWebinar', 'start_datetime', 'duration']
		})
		.select(['title', 'desc', 'images', 'thanks', 'video', 'post_type', 'module', 'created_at', 'product'])
		.then((res:any) => Promise.all(res.map(async(val) => {
			val = val.toObject()
			val.comments = await this.commentModel.find({ content: val._id })
			return val
		})))

		if(content.length == 0) throw new NotFoundException('content not available')
		
		const webinarStatus = content.find(el => el.post_type == 'webinar') ? true : false;
		const videoStatus = content.find(el => el.post_type == 'video') ? true : false;
		const tipsStatus = content.find(el => el.post_type == 'tips') ? true : false;
		
		if(post_type == 'webinar') content = content.filter(el => el.post_type == 'webinar');
		if(post_type == 'video') content = content.filter(el => el.post_type == 'video');
		if(post_type == 'tips') content = content.filter(el => el.post_type == 'tips');

		var videos = []
		var actionModule = []
		var questionModule = []
		var missionModule = []
		var mindmapModule = []
		
		const vThanks = content.map(el => el.thanks.video)
		const randThank = Math.floor(Math.random() * vThanks.length);

		if(content.length > 0){
			content.forEach(el => {
				delete el.post_type
				if(el.module.statement.length > 0){
					actionModule.push(...el.module.statement)
				}

				if(el.module.question.length > 0){
					questionModule.push(...el.module.question)
				}

				if(el.module.mission.length > 0){
					missionModule.push(...el.module.mission)
				}

				if(el.module.mind_map.length > 0){
					mindmapModule.push(...el.module.mind_map)
				}

				const now = new Date()

				if(el.video && el.video.length > 0){
					const video = el.video.map(val => {
						val.thumbnail = el.images.length > 0 ? el.images[0] : ''
						val.participant = val.viewer ? val.viewer.length : 0
						val.total_comment = val.comments ? val.comments.length : 0
						val.point = 3 // Dummy
						val.isLive = false

						const endTime = val.start_datetime.getTime() + (val.duration * 60)

						if( endTime > now.getTime() ) val.isLive = true;

						if(post_type == 'video' && video_id && val._id == video_id){
							videos = el.video;
						}

						return val
					})

					if(post_type == 'webinar'){
						videos.push(...video);
					}

					if(post_type == 'video' && !video_id){
						videos.push(video[0]);
					}
				}
			})
		}

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

		return { menubar, content, videos, thanks, module, moduleMenu }
	}

    async home(product_slug: string, user:any) {
		var product:any = await this.productModel.findOne({slug: product_slug})
		.select(['_id', 'name', 'slug', 'type', 'headline', 'description', 'created_by', 'image_url'])

		if(!product) throw new NotFoundException('product not found');

		const content = await this.contentModel.find({ product: product._id }).select(['thanks', 'video', 'module', 'post_type'])

		if(content.length == 0) throw new NotFoundException('content not available')

		var videos = []
		var modules = []
		var vThanks = []

		if(content.length > 0){
			content.forEach(el => {
				vThanks.push(el.thanks.video)
				if(el.video && el.video.length > 0) videos.push(...el.video);
				if(el.module && el.module.mission.length > 0) modules.push(el.module.mission);
			});
		}

		const imgRandom = Math.floor(Math.random() * product.image_url.length);
		const vidRandom = Math.floor(Math.random() * vThanks.length);

		product = product.toObject()

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

		var menubar = {
			product_slug: product_slug, 
			home: true,
			webinar: content.find(el=>el.post_type == 'webinar') ? true : false,
			video: videos.length == 0 ? false : true,
			tips: content.find(el=>el.post_type == 'tips') ? true : false,
			module: modules.length == 0 ? false : true,
		}

		return {
			available_menu: menubar,
			video_thanks: vThanks[vidRandom],
			image_display: product.image_url[imgRandom],
			created_by: product.created_by,
			title: product.name,
			goal: 'Dummy Goal Of Product',
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

		var videos:any = contents.videos
		
		var webinar = []
		var nextVideos = []

		if(videos.length > 0){
			videos.forEach(res => {
				delete res.comments
				delete res.likes
				delete res.shared

				if(res.isWebinar == true) {
					delete res.isWebinar
					webinar.push(res);
					if(new Date(res.start_datetime).getTime() > new Date().getTime()) nextVideos.push(res);
				}
			});
		}

		const favProduct = await this.idFavoriteProduct(10)
		var product:any = await this.productModel.find({_id: { $in: favProduct }})
		.select(['_id', 'name', 'price', 'sale_price', 'image_url'])

		const recommendProduct = product.map(el => {
			
			const imgRandom = Math.floor(Math.random() * el.image_url.length);
			const discount = el.price == 0 ? 100 : (el.sale_price == 0 ? 0 : Math.floor((el.price - el.sale_price) / el.price * 100))
			el = el.toObject()
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
			delete el.isWebinar

			delete el.participant
			delete el.total_comment
			delete el.point
			delete el.isLive
			delete el.start_datetime
			delete el.duration

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
			delete val.isWebinar
			delete val.start_datetime
			delete val.duration
			delete val.participant
			delete val.total_comment
			delete val.point
			delete val.isLive
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
		var content = contents.content

		const tips = content.map(val => {
			const randImg = Math.floor(Math.random() * val.images.length);
			val.image = val.images[randImg]
			val.point = 3

			val.read_by = {
				_id: '5f9f7296d4148a070021a423',
				name: 'Dummy User',
				avatar: 'https://gravatar.com/avatar/29a1df4646cb3417c19994a59a3e022a?d=mm&r=pg&s=200',
				created_at: '2021-04-27T11:51:56.832+00:00'
			}

			val.total_comment = val.comments ? val.comments.length : 0

			delete val.images
			delete val.video
			// delete val.product
			delete val.module
			delete val.thanks
			delete val.post_type

			return val
		})

		// console.log('content', content)
		const productID = content.map(el => el.product)[0]
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

		if(opt.latest == true || opt.latest == 'true'){
			content = content.sort(dinamicSort('created_at', 'desc'))
		}

		if(opt.recommendation == true || opt.recommendation == 'true') {
			content = content.sort(dinamicSort('total_comment', 'desc'))
		}

		if(opt.watched == true || opt.watched == 'true') {
			content = content.filter(el => el.read_by._id == userID)
		}

		return {
			video_thanks: contents.thanks,
			available_menu: content.menubar,
			shipment_tracking: shipments,
			tips_list: tips
		}
	}

	async tipsDetail(id: string, user?:any, product_slug?: string): Promise<any> {
		const contents = await this.getContent(product_slug, 'tips')

		var tips:any = await this.contentModel.findById(id)
		.select(['_id', 'title', 'images', 'desc', 'created_at', 'author'])
		if(!tips) throw new NotFoundException('content not found')

		const profile = await this.profileModel.findOne({user: user}).select(['_id', 'class'])
		if(!profile) throw new NotFoundException('content not found')

		const contentID = profile.class.map(val => val.product)

		var blogs:any = await this.contentModel.find({ product: { $in: contentID }, isBlog: true })
		.populate('author', ['_id', 'name'])
		.select(['_id', 'title', 'images', 'desc', 'created_at', 'author'])
		if(!blogs) throw new NotFoundException('content not found')

		const imgRandom = Math.floor(Math.random() * tips.images.length);
		
		tips = tips.toObject()
		tips.image = tips.images[imgRandom]
		delete tips.topic
		delete tips.video
		delete tips.tag
		delete tips.product
		delete tips.images

		return {
			available_menu: contents.menubar,
			tips: tips,
			blogs: blogs.map(val => {
				val = val.toObject()
				const imgRandom = Math.floor(Math.random() * val.images.length);
				val.image = val.images[imgRandom]
				delete val.images
				return val
			})
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
}
