import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IContent } from './interfaces/content.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { ITopic } from '../topic/interfaces/topic.interface';
import { TagService } from '../tag/tag.service';
// import { ProductCrudService } from '../product/services/product.crud.service';
// import { ProductContentService } from '../product/services/product.content.service';
// import { CommentService } from '../comment/comment.service';
import { IVideos } from '../videos/interfaces/videos.interface';
import { IBlog } from './interfaces/content-blog.interface';
import { IFulfillment } from './interfaces/content-fulfillment.interface';
import { IProduct } from '../product/interfaces/product.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ContentService {

	constructor(
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		@InjectModel('Content') private readonly blogModel: Model<IBlog>,
		@InjectModel('Content') private readonly fulfillmentModel: Model<IFulfillment>,
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
		@InjectModel('Video') private readonly videoModel: Model<IVideos>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		private readonly tagService: TagService,
		// private readonly productCrudService: ProductCrudService,
		// private readonly productContentService: ProductContentService,
		// private readonly commentService: CommentService,
	) {}

	private async ProjectAggregate(detail: boolean) {
		var project:any = {
			"product._id":1,
			"product.name":1,
			"product.slug":1,
			"product.code":1,
			"product.type":1,
			"product.visibility":1,
			"product.time_period":1,
			"product.headline":1,
			"product.image_url":1,
			"topic._id":1,
			"topic.name":1,
			"topic.icon":1,
			"isBlog":1,
			"title":1,
			"desc":1,
			"images":1,
			"module":1,
			"podcast":1,

			"video._id": 1,
			"video.url": 1,
			"tag._id":1,
			"tag.name":1,
			"author._id":1,
			"author.name":1,
			"placement":1,
			// "series":1,
			"thanks":1,
			// "mentor":1,
			"post_type":1,
			"created_at": 1
		}

		if(detail){
			var project:any = {
				"product":1,
				"topic._id":1,
				"topic.name":1,
				"topic.icon":1,
				"isBlog":1,
				"title":1,
				"desc":1,
				"images":1,
				"module":1,
				"podcast":1,
	
				"video._id": 1,
				"video.url": 1,
				"tag._id":1,
				"tag.name":1,
				"author._id":1,
				"author.name":1,
				"placement":1,
				// "series":1,
				"thanks":1,
				// "mentor":1,
				"post_type":1,
				"created_at": 1
			}
		}

		return project
	}

	private async BridgeTheContent(options: any, detail: boolean) {
		var {
			offset,
			limit,
			sortby,
			sortval,
			fields,
			value,
			optFields,
			optVal,
			id,
		} = options;

		var search = options.search
		const offsets = offset == 0 ? offset : (offset - 1)
		const skip = offsets * limit
		const sortvals = (sortval == 'asc') ? 1 : -1

		var sort: object = {}
		var match: object = { [fields]: resVal }

		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { 'created_at': -1 }
		}

		var resVal = value
		if(value === 'true'){
			resVal = true
		}

		if(value === 'false'){
			resVal = false
		}

		if(fields == 'topic' || fields == 'author'){
			resVal = ObjectId(value)
		}

		if(optFields){
			if(!fields){
				match = { ...match, [optFields]: optVal }
			}
			match = { ...match, [fields]: resVal, [optFields]: optVal }
		}

		const searchKeys = [
			"title", "desc", "tag", "module.statement", "module.question",
			"module.misson", "module.answers.answer", 
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
		// const group = await this.GroupAggregate()

		const query = await this.contentModel.aggregate([
			{$lookup: {
					from: 'products',
					localField: 'product',
					foreignField: '_id',
					as: 'product'
			}},
			{$unwind: {
					path: '$product',
					preserveNullAndEmptyArrays: true
			}},
			{$lookup: {
					from: 'topics',
					localField: 'topic',
					foreignField: '_id',
					as: 'topic'
			}},
			{$lookup: {
					from: 'tag',
					localField: 'tag',
					foreignField: '_id',
					as: 'tag'
			}},
			{$lookup: {
				from: 'videos',
				localField: 'video',
				foreignField: '_id',
				as: 'video'
			}},
			{$lookup: {
				from: 'administrators',
				localField: 'author',
				foreignField: '_id',
				as: 'author'
			}},
			{$unwind: {
				path: '$author',
				preserveNullAndEmptyArrays: true
			}},
			// {$group: group},
			{$sort:sort},
			{$skip: Number(skip)},
			{$limit: !limit ? await this.contentModel.countDocuments() : Number(limit)},
			{$project: project},
			{$match: match},
		])

		return query
	}

	async findAll(options: OptQuery) {
        var content:any = await this.BridgeTheContent(options, false)
		return content
	}

	async create(author: any, input: any): Promise<IContent> {
		input.author = author
		// Check if content name is already exist
        const isContentNameExist = await this.contentModel.findOne({ title: input.title });
        	
		if (isContentNameExist) {
        	throw new BadRequestException('That content title is already exist.');
		}

		if(input.topic){
			const checkTopic = await this.topicModel.find({ _id: { $in: input.topic } })
			if(checkTopic.length !== input.topic.length){
				throw new NotFoundException('Topic not found')
			}
		}

		if(input.isBlog){
			delete input.module
		}else{
			if(!input.module) throw new BadRequestException('Content type is fulfillment. Module is required')
		}

		input.author = author

		const content:any = new this.contentModel(input);
		if(input.tag){
			const tags = input.tag.map(tag => {
				const tagObj = {name: tag, content: content._id}
				return tagObj
			})

			var hashtags
			try {
				hashtags = await this.tagService.insertMany(tags).then(res => res.map(val => val._id))
			} catch (error) {
				throw new NotImplementedException('tag service not valid')
			}
			content.tag = hashtags
		}

		var videos = []
		if(input.video){
			input.video.forEach(res => {
				var videoInput:any = {
					_id: new ObjectId(), created_by: author, ...res
				}
				
				if(input.post_type == 'webinar'){
					videoInput.isWebinar = true
				}

				videos.push(videoInput)

			});

			if(input.post_type == 'webinar'){
				if(videos.filter(el => el.start_datetime).length !== videos.length){
					throw new BadRequestException ("start_datetime required in 'video', because 'post_type' is webinar")
				}

				if(videos.filter(el => el.duration).length !== videos.length){
					throw new BadRequestException ("duration required in 'video', because 'post_type' is webinar")
				}
			}

			await this.videoModel.insertMany(videos)
		}

		content.video = videos.map(el => el._id)

		return await content.save();
	}

	async findById(id: string): Promise<IContent> {
		var opt = { id: id }
		const checkContent = await this.contentModel.findById(id)
		if(!checkContent) throw new NotFoundException('content not found')
		
		const content = await this.BridgeTheContent(opt, true)
        return content.length === 0 ? content : content[0]
	}

	async update(id: string, input: any): Promise<IContent> {
		let data;
		
		// Check ID
		try{
		    data = await this.contentModel.findById(id);
			console.log('data', data)
		}catch(error){
		    throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		if(input.topic){
			const checkTopic = await this.topicModel.find({ _id: { $in: input.topic } })
			if(checkTopic.length !== input.topic.length){
				throw new NotFoundException('Topic not found')
			}
		}

		if(input.isBlog){
			if(input.module){
				delete input.module
			}
		}else{
			if(!input.module) throw new BadRequestException('Content type is fulfilment. Module is required')
			// if(input.module){
			// 	const {statement, question, mission} = input.module
			// 	if(statement && question && mission){
			// 		if(statement.length > 1 && question.length > 1 && mission.length > 1){
			// 			input.series = true
			// 		}
			// 	}
			// }else{
			// 	throw new BadRequestException('Content type is fulfilment. Module is required')
			// }
		}

		try {
			await this.contentModel.findByIdAndUpdate(id, input);
			return await this.contentModel.findById(id);
		} catch (error) {
			throw new Error(error)	
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.contentModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The content could not be deleted');
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try {
			await this.contentModel.deleteMany({ _id: { $in: arrayId } });
			return 'ok';
		} catch (err) {
			throw new NotImplementedException('The content could not be deleted');
		}
	}

	async postAnswer(content_id: string, module_id: string, input: any) {
		input.answer_date = new Date()

		if(input.mission_complete === true || input.mission_complete === 'true'){
			input.mission_complete = new Date()
		}else{
			delete input.mission_complete
		}
		
		await this.contentModel.findOneAndUpdate(
			{_id: content_id, "module._id": module_id},
			{ "module.$.answers": input}
		)

		return await this.contentModel.findById(content_id)
	}

	async store(userID: string, input: any, type: string): Promise<any> {
		input.author = userID
		input.isBlog = type == 'blog' ? true : false

		var videos = []

		var query
		if(type == 'blog'){
			const isContentNameExist = await this.contentModel.findOne({ title: input.title });
        	
			if (isContentNameExist) {
				throw new BadRequestException('The content title is already exist.');
			}

			if(input.topic){
				const checkTopic = await this.topicModel.find({ _id: { $in: input.topic } })
				if(checkTopic.length !== input.topic.length){
					throw new NotFoundException('Topic not found')
				}
			}

			if(input.video){
				input.video.forEach(res => {
					var videoInput:any = {
						_id: new ObjectId(), created_by: userID, ...res
					}
	
					videos.push(videoInput)
				});
			}
			input.video = videos

			query = new this.blogModel(input)
		}else{
			const findProduct = await this.productModel.findById(input.product);
        	
			if (!findProduct) {
				throw new BadRequestException('Product not found.');
			}

			const { title, topic, images, placement, post_type } = input.post;

			const isContentNameExist = await this.contentModel.findOne({ title: title });
        	
			if (isContentNameExist) {
				throw new BadRequestException('The post title is already exist.');
			}
			
			if(topic){
				const checkTopic = await this.topicModel.find({ _id: { $in: topic } })
				if(checkTopic.length !== topic.length){
					throw new NotFoundException('Topic not found')
				}
			}

			if(!placement) throw new BadRequestException('post.placement is required');
			if(!post_type) throw new BadRequestException('post.post_type is required');

			const placementEnum = ['spotlight', 'stories']
			const postTypeEnum = ['webinar', 'video', 'tips']

			if(!placementEnum.includes(placement)) throw new BadRequestException('available post.placement is: ' + placementEnum.toString());
			
			if(!postTypeEnum.includes(post_type)) throw new BadRequestException('available post.placement is: ' + postTypeEnum.toString());

			if(post_type == 'webinar'){
				if(!input.webinar) throw new BadRequestException(`post_type=${post_type}, webinar input is required`)
				const platform = ['zoom', 'google-meet', 'youtube', 'aws-s3']
	
				input.webinar.forEach(res => {
					if(!res.platform) throw new BadRequestException('webinar.platform is required');
					if(!platform.includes(res.platform)) throw new BadRequestException('available weinar.platform is: ' + platform.toString());
	
					if(!res.url) throw new BadRequestException('webinar.url is required');
					if(!res.title) throw new BadRequestException('webinar.title is required');
					if(!res.start_datetime) throw new BadRequestException('webinar.start_datetime is required');
					if(!res.duration) throw new BadRequestException('webinar.duration is required');
	
					var videoInput:any = {
						_id: new ObjectId(), 
						created_by: userID, 
						isWebinar: true,
						...res
					}
	
					videos.push(videoInput)
				});

				if(input.video) delete input.video;
				if(input.tips) delete input.tips;
			}
			
			if(post_type == 'video'){
				if(!input.video) throw new BadRequestException(`post_type=${post_type}, video input is required`)

				input.video.forEach(res => {
					var videoInput:any = {
						_id: new ObjectId(), created_by: userID, ...res
					}
	
					videos.push(videoInput)
				});

				if(input.webinar) delete input.webinar;
				if(input.tips) delete input.tips;
			}

			if(post_type == 'tips'){
				const { tips } = input;
				if(!tips) throw new BadRequestException(`post_type=${post_type}, tips input is required`)
				input.desc = tips

				if(input.webinar) delete input.webinar;
				if(input.tips) delete input.tips;
				delete input.tips
			}

			input.title = title
			input.topic = topic
			input.images = images
			input.placement = placement
			input.post_type = post_type
			input.video = videos

			delete input.post

			query = new this.fulfillmentModel(input)
		}

		try {
			await query.save()
			await this.videoModel.insertMany(videos)
		} catch (error) {
			throw new NotImplementedException("can't create the content / video data")	
		}

		return query
	}
}
