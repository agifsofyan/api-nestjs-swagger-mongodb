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
import { ProductCrudService } from '../product/services/product.crud.service';
import { ProductContentService } from '../product/services/product.content.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ContentService {

	constructor(
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
		private readonly productCrudService: ProductCrudService,
		private readonly productContentService: ProductContentService,
		private readonly tagService: TagService
	) {}

	private async ProjectAggregate(detail: boolean) {
		var project:any = {
			"_id":1,
			"product._id":1,
			"product.name":1,
			"product.slug":1,
			"product.code":1,
			"product.type":1,
			"product.visibility":1,
			"product.time_period":1,
			"topic._id":1,
			"topic.name":1,
			"topic.icon":1,
			"isBlog":1,
			"title":1,
			"desc":1,
			"images":1,
			"module":1,
			"podcast":1,
			"video":1,
			"tag._id":1,
			"tag.name":1,
			"author._id":1,
			"author.name":1,
			"placement":1,
			"series":1,
			"thanks":1,
			// "mentor":1,
			"post_type":1,
			"created_at": 1
		}

		if(detail){
			project = {
				"_id":1,
				"product":1,
				"topic":1,
				"isBlog":1,
				"title":1,
				"desc":1,
				"images":1,
				"module":1,
				"podcast":1,
				"video":1,
				"tag":1,
				"author":1,
				"placement":1,
				"series":1,
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

		var sort: object = {}
		var match: object = { [fields]: resVal }

		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { 'updated_at': -1 }
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

		const query = await this.contentModel.aggregate([
			{$lookup: {
					from: 'products',
					localField: 'product._id',
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
				from: 'administrators',
				localField: 'author',
				foreignField: '_id',
				as: 'author'
			}},
			{$unwind: {
				path: '$author',
				preserveNullAndEmptyArrays: true
			}},
			{$project: project},
			{$match: match},
			{$limit: !limit ? await this.contentModel.countDocuments() : Number(limit)},
			{$skip: Number(skip)},
			{$sort:sort}
		])

		return query
	}

	async findAll(options: OptQuery) {
        return await this.BridgeTheContent(options, false)
	}

	async create(author: any, input: any): Promise<IContent> {
		// Check if content name is already exist
        const isContentNameExist = await this.contentModel.findOne({ title: input.title });
        	
		if (isContentNameExist) {
        	throw new BadRequestException('That content title is already exist.');
		}

		if(!input.product._id){
			throw new BadRequestException('product id is required')
		}else{
			const product = await this.productCrudService.findById(input.product._id)
			input.product.type = product.type
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
			if(input.module){
				const {statement, question, mission} = input.module
				if(statement && question && mission){
					if(statement.length > 1 && question.length > 1 && mission.length > 1){
						input.series = true
					}
				}
			}else{
				throw new BadRequestException('Content type is fulfilment. Module is required')
			}
		}

		input.author = author

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

	async findById(id: string): Promise<IContent> {
		var opt = { id: id }
		const content = await this.BridgeTheContent(opt, true)
        return content.length === 0 ? content : content[0]
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

		if(!input.product._id){
			throw new BadRequestException('product id is required')
		}else{
			const product = await this.productCrudService.findById(input.product._id)
			input.product.type = product.type
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
			if(input.module){
				const {statement, question, mission} = input.module
				if(statement && question && mission){
					if(statement.length > 1 && question.length > 1 && mission.length > 1){
						input.series = true
					}
				}
			}else{
				throw new BadRequestException('Content type is fulfilment. Module is required')
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
