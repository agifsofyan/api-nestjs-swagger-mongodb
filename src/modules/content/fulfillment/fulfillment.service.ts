import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IFulfillment } from './interfaces/fulfillment.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { ITopic } from '../../topic/interfaces/topic.interface';
import { IVideos } from '../../videos/interfaces/videos.interface';
import { IProduct } from '../../product/interfaces/product.interface';
import { 
	UrlValidation, 
	videoExValidation, 
	pdfExValidation, 
	audioExValidation 
} from 'src/utils/CustomValidation';
import { dinamicSort } from 'src/utils/helper';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class FulfillmentService {

	constructor(
		@InjectModel('Fulfillment') private readonly fulfillmentModel: Model<IFulfillment>,
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
		@InjectModel('Video') private readonly videoModel: Model<IVideos>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>
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

		query = await this.fulfillmentModel.find(match).skip(skip).limit(limits).sort(sort)

		return query.map(val => {
			val = val.toObject()
			val.isBlog = false
			return val
		})
	}

	async create(author: any, input: any): Promise<IFulfillment> {
		var ff:any = await this.fulfillmentModel.findOne({product: input.product})
		if(!ff) ff = new this.fulfillmentModel(input)
		if(ff.module){
			const { statement, question, mission, mind_map } = ff.module

			if(!statement && !question && !mission && !mind_map) throw new BadRequestException('statement / question / mission / mind_map in module is required');

			if(statement){
				statement.forEach(el => {
					if(!el.value) throw new BadRequestException('module.statement.value is required');
				});
			}
			if(question){
				question.forEach(el => {
					if(!el.value) throw new BadRequestException('module.question.value is required');
				});
			}
			if(mission){
				mission.forEach(el => {
					if(!el.value) throw new BadRequestException('module.mission.value is required');
				});
			}
			if(mind_map){
				mind_map.forEach(el => {
					if(!el.value) throw new BadRequestException('module.mind_map.value is required');
					const urlValid = UrlValidation(el.value)
					const pdfValid = pdfExValidation(el.value)
	
					if(!urlValid) throw new BadRequestException('mind_map.value not valid');
					if(!pdfValid) throw new BadRequestException('mind_map.value format not valid, available is PDF');
				});
			}
			ff.module.author = author
		}

		const placementEnum = ['spotlight', 'stories', 'none']
		const postTypeEnum = ['webinar', 'video', 'tips']

		var videos = []
		//var posted = []

		if(input.post && input.post.length > 0){
			const posted = input.post.map(async(res): Promise<any> => {
				const {
					topic,
					title,
					images,
					post_type,
					placement,
					podcast,
					webinar,
					video,
					tips
				} = res
				
				if(!title) throw new BadRequestException('post.title is required');

				const isFulfillmentNameExist = await this.fulfillmentModel.findOne({ product: { $nin: [ff.product] }, 'post.title': title });
        	
				if (isFulfillmentNameExist) {
					throw new BadRequestException('That fulfillment post.title is already exist.');
				}
	
				if(!topic) throw new BadRequestException('post.topic is required');
				const checkTopic = await this.topicModel.findById(topic)
				if(!checkTopic) throw new NotFoundException('Topic not found');

				if(!images) throw new BadRequestException('post.images is required');
				if(!post_type) throw new BadRequestException('post.post_type is required');
				//if(!placement) throw new BadRequestException('post.placement is required');
	
				if(placement && !placementEnum.includes(placement)) throw new BadRequestException('available post.placement is: ' + placementEnum.toString());
		
				if(!postTypeEnum.includes(post_type)) throw new BadRequestException('available post.post_type is: ' + postTypeEnum.toString());

				if(post_type == 'video'){
					if(!video) throw new BadRequestException(`post_type=${post_type}, video input is required`)
	
					if(!video.url) throw new BadRequestException('video.url is required');
	
					const urlValid = UrlValidation(video.url)
					const videoValid = videoExValidation(video.url)
	
					if(!urlValid) throw new BadRequestException('video.url not valid');
					if(!videoValid) throw new BadRequestException('video.url format not valid');
					
					var videoInput:any = {
						_id: new ObjectId(), 
						created_by: author,
						title: title,
						isWebinar: false,
						...res.video
					}

					videos.push(videoInput)
	
					res.video = videoInput._id

					if(podcast){
						const audioUrl = UrlValidation(podcast.url)
						const audioValid = audioExValidation(podcast.url)
		
						if(!audioUrl) throw new BadRequestException('podcast.url not valid');
						if(!audioValid) throw new BadRequestException('podcast.url format not valid, available to audio format extention');
					}
	
					if(res.webinar) delete res.webinar;
					if(res.tips) delete res.tips;
				}
				
				if(post_type == 'webinar'){
					if(!webinar) throw new BadRequestException(`post_type=${post_type}, webinar input is required`)
					
					const platform = ['zoom', 'google-meet', 'youtube', 'aws-s3']
						
					if(!webinar.platform) throw new BadRequestException('webinar.platform is required');
					if(!platform.includes(webinar.platform)) throw new BadRequestException('available webinar.platform is: ' + platform.toString());
	
					if(!webinar.url) throw new BadRequestException('webinar.url is required');
	
					const urlValid = UrlValidation(webinar.url)
	
					if(!urlValid) throw new BadRequestException('webinar.url not valid');
	
					if(!webinar.start_datetime) throw new BadRequestException('webinar.start_datetime is required');
					if(!webinar.duration) throw new BadRequestException('webinar.duration is required');
	
					var webinarInput:any = {
						_id: new ObjectId(), 
						created_by: author,
						title: title,
						isWebinar: true,
						...res.webinar
					}
					videos.push(webinarInput)
					
					res.webinar = webinarInput._id
	
					if(res.video) delete res.video;
					if(res.tips) delete res.tips;
					if(res.podcast) delete res.podcast;
				}
	
				if(post_type == 'tips'){
					if(!tips) throw new BadRequestException('post.tips is required in post_type: tips');
					if(res.video) delete res.video;
					if(res.webinar) delete res.webinar;
					if(res.podcast) delete res.podcast;
				}

				res.author = author
				res.postdate = new Date()
	
				return res
				//ff.post.unshift(res)
			})

			ff.post = await Promise.all(posted)
		}

		//console.log('posted', posted)
		//ff.post = posted

		await ff.save()

		if(videos.length > 0) await this.videoModel.insertMany(videos);

		return ff
	}

	async findById(id: string): Promise<any> {
		const fulfillment = await this.fulfillmentModel.findById(id)
		.populate('product', ['_id', 'name', 'slug'])
		.populate('module.author', ['_id', 'name'])
		.populate('post.author', ['_id', 'name'])
		.populate('post.webinar', ['_id', 'url', 'start_datetime', 'duration', 'platform'])
		.populate('post.video', ['_id', 'url', 'platform'])

		if(!fulfillment) return 404;

		return fulfillment
	}

	async update(id: string, input: any, author: any) {
		let data:any;

		const { post } = input
		
		// Check ID
		try{
		    data = await this.fulfillmentModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find fulfillment with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find fulfillment with id ${id}`);
		}

		var oldVideos = []
		//var posted = data.post ? data.post : []

		if(data.post){
			data.post.forEach(el => {
				if(el.webinar) oldVideos.push(el.webinar);
				if(el.video) oldVideos.push(el.video);
			});
		}

		if(input.module){
			const { statement, question, mission, mind_map } = input.module

			if(!statement && !question && !mission && !mind_map) throw new BadRequestException('statement / question / mission / mind_map in module is required');

			if(statement){
				statement.forEach(el => {
					if(!el.value) throw new BadRequestException('module.statement.value is required');
				});
			}
			if(question){
				question.forEach(el => {
					if(!el.value) throw new BadRequestException('module.question.value is required');
				});
			}
			if(mission){
				mission.forEach(el => {
					if(!el.value) throw new BadRequestException('module.mission.value is required');
				});
			}
			if(mind_map){
				mind_map.forEach(el => {
					if(!el.value) throw new BadRequestException('module.mind_map.value is required');
					const urlValid = UrlValidation(el.value)
					const pdfValid = pdfExValidation(el.value)
	
					if(!urlValid) throw new BadRequestException('mind_map.value not valid');
					if(!pdfValid) throw new BadRequestException('mind_map.value format not valid, available is PDF');
				});
			}

			input.module.author = author

			data.module = input.module
		}

		const placementEnum = ['spotlight', 'stories', 'none']
		const postTypeEnum = ['webinar', 'video', 'tips']

		var videos = []

		if(post){
			const posted = post.map(async(res): Promise<any> => {
				const {
					topic,
					title,
					images,
					post_type,
					placement,
					podcast,
					webinar,
					video,
					tips
				} = res
				
				if(!title) throw new BadRequestException('post.title is required');
				const isFulfillmentNameExist = await this.fulfillmentModel.findOne({ _id: { $nin: [id] }, 'post.title': title });
        	
				if (isFulfillmentNameExist) {
					throw new BadRequestException('That fulfillment post.title is already exist.');
				}
	
				if(!topic) throw new BadRequestException('post.topic is required');
				const checkTopic = await this.topicModel.findById(topic)
				if(!checkTopic) throw new NotFoundException('Topic not found');

				if(!images) throw new BadRequestException('post.images is required');
				if(!post_type) throw new BadRequestException('post.post_type is required');
				//if(!placement) throw new BadRequestException('post.placement is required');
	
				if(placement && !placementEnum.includes(placement)) throw new BadRequestException('available post.placement is: ' + placementEnum.toString());
		
				if(!postTypeEnum.includes(post_type)) throw new BadRequestException('available post.post_type is: ' + postTypeEnum.toString());
	
				if(post_type == 'video'){
					if(!video) throw new BadRequestException(`post_type=${post_type}, video input is required`)
	
					if(!video.url) throw new BadRequestException('video.url is required');
	
					const urlValid = UrlValidation(video.url)
					const videoValid = videoExValidation(video.url)
	
					if(!urlValid) throw new BadRequestException('video.url not valid');
					if(!videoValid) throw new BadRequestException('video.url format not valid');
					
					var videoInput:any = {
						_id: new ObjectId(), 
						created_by: author,
						title: title,
						isWebinar: false,
						...res.video
					}
	
					videos.push(videoInput)
	
					res.video = videoInput._id

					if(podcast){
						const audioUrl = UrlValidation(podcast.url)
						const audioValid = audioExValidation(podcast.url)
		
						if(!audioUrl) throw new BadRequestException('podcast.url not valid');
						if(!audioValid) throw new BadRequestException('podcast.url format not valid, available to audio format extention');
					}
	
					if(res.webinar) delete res.webinar;
					if(res.tips) delete res.tips;
				}
				
				if(post_type == 'webinar'){
					if(!webinar) throw new BadRequestException(`post_type=${post_type}, webinar input is required`)
					
					const platform = ['zoom', 'google-meet', 'youtube', 'aws-s3']
						
					if(!webinar.platform) throw new BadRequestException('webinar.platform is required');
					if(!platform.includes(webinar.platform)) throw new BadRequestException('available webinar.platform is: ' + platform.toString());
	
					if(!webinar.url) throw new BadRequestException('webinar.url is required');
	
					const urlValid = UrlValidation(webinar.url)
	
					if(!urlValid) throw new BadRequestException('webinar.url not valid');

					if(!webinar.start_datetime) throw new BadRequestException('webinar.start_datetime is required');
					if(!webinar.duration) throw new BadRequestException('webinar.duration is required');
	
					var webinarInput:any = {
						_id: new ObjectId(), 
						created_by: author,
						title: title,
						isWebinar: true,
						...res.webinar
					}
					
					videos.push(webinarInput)
					
					res.webinar = webinarInput._id
	
					if(video) delete res.video;
					if(tips) delete res.tips;
					if(podcast) delete res.podcast;
				}
	
				if(post_type == 'tips'){
					if(!tips) throw new BadRequestException('post.tips is required in post_type: tips');
					if(video) delete res.video;
					if(webinar) delete res.webinar;
					if(podcast) delete res.podcast;
				}

				res.author = author
				res.postdate = new Date()
console.log('res', res)
				return res
			})

			data.post = await Promise.all(posted)
		}
		console.log('data.post', data.post)

		try {
			await data.save()
		
			if(videos.length > 0) await this.videoModel.insertMany(videos);
			if(oldVideos.length > 0) await this.videoModel.deleteMany({ _id: { $in: oldVideos }});
			return data
		} catch (error) {
			throw new NotImplementedException("can't implemented")	
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.fulfillmentModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The fulfillment could not be deleted');
		}
	}

	async postAnswer(fulfillment_id: string, module_id: string, input: any) {
		input.answer_date = new Date()

		if(input.mission_complete === true || input.mission_complete === 'true'){
			input.mission_complete = new Date()
		}else{
			delete input.mission_complete
		}
		
		await this.fulfillmentModel.findOneAndUpdate(
			{_id: fulfillment_id, "module._id": module_id},
			{ "module.$.answers": input}
		)

		return await this.fulfillmentModel.findById(fulfillment_id)
	}

	async postList(product_id: string) {
		const product = await this.productModel.findById(product_id)
		if(!product) throw new NotFoundException('product not found');

		let query:any = await this.fulfillmentModel.findOne({product:product_id})
		.populate('product', ['_id', 'name'])
		.populate('post.topic', ['_id', 'name'])
		.populate('post.webinar', ['_id', 'url', 'platform', 'start_datetime', 'duration'])
		.populate('post.video', ['_id', 'url'])
		.populate('post.author', ['_id', 'name'])
		.select(['_id', 'product', 'post'])

		if(!query) throw new NotFoundException('fulfillment content not found');
		 
		var descPost = []
		if(query.post && query.post.length > 0){
			//const sortPost = query.post.sort(dinamicSort('postdate', 'desc'))
			query.post.forEach(el => {
				if(el) descPost.unshift(el);
			})
		}
		
		query.post = descPost
		return query
	}

	async fulfillmentDetail(product_slug: string) {
		const product = await this.productModel.findOne({ slug: product_slug})
		if(!product) throw new NotFoundException('product not found')
		const query = await this.fulfillmentModel.findOne({ product: product._id })
		.populate('product', ['_id', 'name', 'slug'])
		.populate('module.author', ['_id', 'name'])
		.populate('post.author', ['_id', 'name'])
		.populate('post.webinar', ['_id', 'url', 'start_datetime', 'duration', 'platform'])
		.populate('post.video', ['_id', 'url', 'platform'])
		return query
	}
}
