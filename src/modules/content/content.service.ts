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
import { TagService } from '../tag/tag.service';
import { ProductCrudService } from '../product/services/product.crud.service';
import { ProductContentService } from '../product/services/product.content.service';

@Injectable()
export class ContentService {

	constructor(
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
		private readonly productCrudService: ProductCrudService,
		private readonly productContentService: ProductContentService,
		private readonly tagService: TagService
	) {}

	async create(input: any): Promise<IContent> {
		// Check if content name is already exist
        const isContentNameExist = await this.contentModel.findOne({ title: input.title });
        	
		if (isContentNameExist) {
        	throw new BadRequestException('That content title is already exist.');
		}

		await this.productCrudService.findById(input.product)

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

			var hashtags
			try {
				hashtags = await this.tagService.insertMany(tags).then(res => res.map(val => val._id))
			} catch (error) {
				throw new NotImplementedException('tag service not valid')
			}
			content.tag = hashtags
		}

		return await content.save();
	}

	async findAll(userID: string, options: OptQuery, filter: any): Promise<IContent[]> {
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

		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { 'updated_at': -1 }
		}

		if(search){
			const searching = search.replace("%20", " ")
			match = {
				...match,
				$or: [
					{ title: {$regex: ".*" + searching + ".*", $options: "i"} },
					{ desc: {$regex: ".*" + searching + ".*", $options: "i"} },
					{ tag: {$regex: ".*" + searching + ".*", $options: "i"} },
					{ "module.statement": {$regex: ".*" + searching + ".*", $options: "i"} },
					{ "module.question": {$regex: ".*" + searching + ".*", $options: "i"} },
					{ "module.misson": {$regex: ".*" + searching + ".*", $options: "i"} },
					{ "module.answers.answer": {$regex: ".*" + searching + ".*", $options: "i"} },
				]
			}
		}

		if(optFields){
			if(!fields){
				match = { ...match, [optFields]: optVal }
			}
			match = { ...match, [fields]: resVal, [optFields]: optVal }
		}

		// on best seller / trending
		if(filter.trending === true || filter.trending === 'true'){
			const bestseller = await this.productCrudService.bestSeller().then(res => res.map(res => res.product_id))
			match = {
				...match,
				product: {$in: bestseller}
			}
		}

		// on user favorite
		if(filter.favorite === true || filter.favorite === 'true'){
			match = {
				...match,
				product: await this.productCrudService.onTrending(userID)
			}
		}

		if(filter.is_paid === true || filter.is_paid === 'true'){
			const productPaid = await this.productCrudService.onPaid(userID, "UNPAID")
			match = {
				...match,
				product: { $in: productPaid }
			}
		}

		const query =  await this.contentModel.find(match)
		.skip(Number(skip)).limit(Number(limit)).sort(sort)
		.populate({
			path: 'product',
			select: {_id:1, name:1, slug:1, code:1, type:1, visibility:1}
		})
		.populate({
			path: 'topic',
			select: {_id:1, name:1, slug:1, icon:1}
		})
		.populate({
			path: 'author',
			select: {_id:1, name:1}
		})
		.populate({
			path: 'tag',
			select: {_id:1, name:1}
		})

		return query
	}

	async findById(id: string): Promise<IContent> {
	 	let data;
		try{
		    data = await this.contentModel.findOne({ _id: id})
			.populate({
				path: 'product',
				select: {_id:1, name:1, slug:1, code:1, type:1, visibility:1}
			})
			.populate({
				path: 'topic',
				select: {_id:1, name:1, slug:1, icon:1}
			})
			.populate({
				path: 'author',
				select: {_id:1, name:1}
			})
			.populate({
				path: 'tag',
				select: {_id:1, name:1}
			})
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
			await this.productCrudService.findById(input.product)
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

	async findByWebinar (options: OptQuery) {
		const query = await this.productContentService.productInTheSameTime(options)
		return query
	}
}
