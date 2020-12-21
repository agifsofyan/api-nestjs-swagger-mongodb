import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IContent } from './interfaces/content.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { ITopic } from '../topic/interfaces/topic.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { HashTagService } from '../hashtag/hashtag.service';

@Injectable()
export class ContentService {

	constructor(
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		private readonly tagService: HashTagService
	) {}

	async create(input: any): Promise<IContent> {

		// Check if content name is already exist
        const isContentNameExist = await this.contentModel.findOne({ name: input.name });
        	
		if (isContentNameExist) {
        	throw new BadRequestException('That content name is already exist.');
		}

		if(input.product){
			const checkProduct = await this.productModel.find({ _id: { $in: input.product } })
			if(checkProduct.length !== input.product.length){
				throw new NotFoundException('Product not found')
			}
		}

		if(input.topic){
			const checkTopic = await this.topicModel.find({ _id: { $in: input.topic } })
			if(checkTopic.length !== input.topic.length){
				throw new NotFoundException('Topic not found')
			}
		}

		const content = new this.contentModel(input);

		if(input.hashtag){
			const hashtag = input.hashtag.map(tag => {
				const tagObj = {name: tag, content: content._id}
				return tagObj
			})

			const hashtags = await this.tagService.insertMany(hashtag).then(res => res.map(val => val._id))

			input.hashtag = hashtags
		}

		return await content.save();
	}

	async findAll(options: OptQuery): Promise<IContent[]> {
		const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
		const skip = offset * options.limit;
		const sortval = (options.sortval == 'asc') ? 1 : -1;

		if (options.sortby){
			if (options.fields) {

				return await this.contentModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
			} else {

				return await this.contentModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
			}
		}else{
			if (options.fields) {

				return await this.contentModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })
			} else {

				return await this.contentModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })
			}
		}
	}

	async findById(id: string): Promise<IContent> {
	 	let data;
		try{
		    data = await this.contentModel.findOne({ _id: id})
		}catch(error){
		    throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		return data;
	}

	async update(id: string, input: any): Promise<IContent> {
		let data;
		
		// Check ID
		try{
		    data = await this.contentModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		if(input.product){
			const checkProduct = await this.productModel.find({ _id: { $in: input.product } })
			if(checkProduct.length !== input.product.length){
				throw new NotFoundException('Product not found')
			}
		}

		if(input.topic){
			const checkTopic = await this.topicModel.find({ _id: { $in: input.topic } })
			if(checkTopic.length !== input.topic.length){
				throw new NotFoundException('Topic not found')
			}
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

	async search(value: any): Promise<IContent[]> {
		const result = await this.contentModel.find({ $text: { $search: value.search } })

		if (!result) {
			throw new NotFoundException("Your search was not found")
		}

		return result
	}
}
