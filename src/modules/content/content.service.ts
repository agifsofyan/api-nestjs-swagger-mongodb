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
import { TagService } from '../tag/tag.service';

@Injectable()
export class ContentService {

	constructor(
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		private readonly tagService: TagService
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

		if(input.tag){
			const tags = input.tag.map(tag => {
				const tagObj = {name: tag, content: content._id}
				return tagObj
			})

			const hashtags = await this.tagService.insertMany(tags).then(res => res.map(val => val._id))

			input.tag = hashtags
		}

		return await content.save();
	}

	async findAll(options: OptQuery): Promise<IContent[]> {
		const {
			offset,
			limit,
			sortby,
			sortval,
			fields,
			value,
			optFields,
			optVal,
		} = options;

		var search = options.search
		const offsets = offset == 0 ? offset : (offset - 1)
		const skip = offsets * limit
		const sortvals = (sortval == 'asc') ? 1 : -1

		var resVal = value
		if(value === 'true'){
			resVal = true
		}

		if(value === 'false'){
			resVal = false
		}

		var sort: object = {}
		var match: object = { [fields]: resVal }

		if(optFields){
			if(!fields){
				match = { [optFields]: optVal }
			}
			match = { [fields]: resVal, [optFields]: optVal }
		}
		
		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { 'updated_at': -1 }
		}

		if(search){
			search = search.replace("%20", " ")
			match = { $text: { $search: search } }
		}

		// const query = await this.contentModel.find(match).skip(skip).limit(limits).sort(sort)
		const query = await this.contentModel.aggregate([
			{$match: match},
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
					from: 'administrators',
					localField: 'author',
					foreignField: '_id',
					as: 'author'
			}},
			{$unwind: {
					path: '$author',
					preserveNullAndEmptyArrays: true
			}},
			{$lookup: {
				from: 'tags',
				localField: 'tag',
				foreignField: '_id',
				as: 'tag'
			}},
			{$unwind: {
					path: '$tag',
					preserveNullAndEmptyArrays: true
			}},
			{ $project: {
				name: 1,
				isBlog: 1,
				cover_img: 1,
				"product._id":1, 
				"product.name":1, 
				"product.slug":1, 
				"product.code":1, 
				"product.type":1, 
				"product.visibility":1,
				"topic._id":1, 
				"topic.name":1, 
				"topic.slug":1, 
				"topic.icon":1,
				title: 1,
				desc: 1,
				images: 1,
				module : 1,
				podcast: 1,
				video: 1,
				"author._id":1, 
				"author.name":1,
				"tag._id":1, 
				"tag.name":1,
				created_at: 1
			}},
			{$limit: !limit ? await this.contentModel.countDocuments() : Number(limit)},
			{$skip: Number(skip)},
			{$sort: sort}
		])

		return query
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
