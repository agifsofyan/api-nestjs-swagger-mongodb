import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IBlog } from './interfaces/blog.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { ITopic } from '../../topic/interfaces/topic.interface';
import { IVideos } from '../../videos/interfaces/videos.interface';
import { IProduct } from '../../product/interfaces/product.interface';
import { UrlValidation, videoExValidation } from 'src/utils/CustomValidation';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class BlogService {

	constructor(
		@InjectModel('Blog') private readonly blogModel: Model<IBlog>,
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

		query = await this.blogModel.find(match).skip(skip).limit(limits).sort(sort)

		return query.map(val => {
			val = val.toObject()
			val.isBlog = true
			return val
		})
	}

	async create(author: any, input: any): Promise<IBlog> {
		input.author = author
		// Check if blog name is already exist
        const isBlogNameExist = await this.blogModel.findOne({ title: input.title });
        	
		if (isBlogNameExist) {
        	throw new BadRequestException('That blog title is already exist.');
		}

		if(input.topic){
			const checkTopic = await this.topicModel.find({ _id: { $in: input.topic } })
			if(checkTopic.length !== input.topic.length){
				throw new NotFoundException('Topic not found')
			}
		}

		var videos = []
		if(input.video){
			input.video.forEach(res => {
				if(!res.url) throw new BadRequestException('video.url is required');

				const urlValid = UrlValidation(res.url)
				const videoValid = videoExValidation(res.url)

				if(!urlValid) throw new BadRequestException('video.url not valid');
				if(!videoValid) throw new BadRequestException('video format not valid');

				var videoInput:any = {
					_id: new ObjectId(), 
					created_by: author,
					...res
				}

				videos.push(videoInput)
			});
		}
		input.video = videos

		const blog = new this.blogModel(input);

		await blog.save();

		return blog
	}

	async findById(id: string): Promise<any> {
		const blog = await this.blogModel.findById(id)
		.populate('author', ['_id', 'name'])
		.populate('video', ['_id', 'url', 'platform'])
		if(!blog) return 404;

		return blog
	}

	async update(id: string, input: any): Promise<IBlog> {
		let data;
		
		// Check ID
		try{
		    data = await this.blogModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find blog with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find blog with id ${id}`);
		}

		if(input.topic){
			const checkTopic = await this.topicModel.find({ _id: { $in: input.topic } })
			if(checkTopic.length !== input.topic.length){
				throw new NotFoundException('Topic not found')
			}
		}

		try {
			await this.blogModel.findByIdAndUpdate(id, input);
			return await this.blogModel.findById(id);
		} catch (error) {
			throw new Error(error)	
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.blogModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The blog could not be deleted');
		}
	}
}
