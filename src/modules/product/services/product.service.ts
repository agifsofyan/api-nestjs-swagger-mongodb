import {
	Injectable,
	NotFoundException,
	BadRequestException,
	NotImplementedException
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IProduct } from '../interfaces/product.interface';
import { ITopic } from '../../topic/interfaces/topic.interface';
import { IAdmin } from '../../administrator/interfaces/admin.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { 
	TimeValidation, 
	DecimalValidation, 
	StringValidation, 
	UrlValidation, 
	productValid
} from 'src/utils/CustomValidation';

import {
	Slugify,
	ForceToCode
} from 'src/utils/StringManipulation';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ProductService {

	constructor(
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
		@InjectModel('Admin') private readonly adminModel: Model<IAdmin>
	) {}

	async create(userId: any, input: any): Promise<IProduct> {
		const {
			type,
			name,
			topic,
			agent,
			price,
			sale_price,
			webinar,
			ecommerce
		} = input
		
		input.created_by = userId

		const isNameExist = await this.productModel.findOne({ name: name })
		if(isNameExist){
			throw new BadRequestException('Name product is already exist')
		}

		/** Product Slug Start */
		var makeSlug = Slugify(name)
		if(input.slug){
			makeSlug = Slugify(input.slug)
		}
		
		const isSlugExist = await this.productModel.findOne({ slug: makeSlug })
		if (isSlugExist) {
			throw new BadRequestException('That product slug is already exist.')
		}
		input.slug = makeSlug
		/** Product Slug End */

		// Check Topic ID
		if(topic){
		
			const getTopic = await this.topicModel.find({ _id: { $in: topic }})
			
			if(getTopic.length !== topic.length){
				throw new BadRequestException(`Topic not found`)
			}

			input.topic = topic
		}

		// Check Agent (User) ID
		if(agent){
			const getAgent = await this.adminModel.find({ _id: { $in: agent }})
			
			if(getAgent.length !== agent.length){
				throw new BadRequestException(`Agent not found`)
			}

			input.agent = agent
		}

		/** Product Code Start */
		var makeCode = ForceToCode(name)

		if(input.code){
			makeCode = input.code
		}
		
		if(!StringValidation(makeCode)){
			throw new BadRequestException('product code must be string')
		}

		const checkCode = await this.productModel.findOne({ code: makeCode })
		if (checkCode) {
			throw new BadRequestException('Product code is already exist.')
		}

		input.code = makeCode

		const valid = productValid(input)
		if(valid === 'webinar'){
			input.ecommerce = {}
		}else if(valid === 'ecommerce'){
			input.webinar = {}
		}else{
			input.ecommerce = {}
			input.webinar = {}
		}
		
		const result = new this.productModel(input)
		return await result.save()
	}

	async update(id: string, input: any, userId: any): Promise<IProduct> {
		// Check Id
		const checkProduct = await this.productModel.findById(id);

		if (!checkProduct) {
			throw new NotFoundException(`Could nod find product with id ${id}`);
		}
		
		input.updated_at = userId

		//var result = new this.productModel(input)
		//result._id = id

		//input.name = (!input.name) ? checkProduct.name : input.name

		/** Product Slug Start */
		if(input.name){
			input.slug = Slugify(input.name)
			console.log('input.slug', input.slug)
			if(input.slug){
				input.slug = Slugify(input.slug)
			}
			
			const isSlugExist = await this.productModel.findOne({ _id: { $ne: checkProduct._id }, slug: input.slug})
			console.log(`check: ${checkProduct._id}, checkSlug: ${isSlugExist}`)
			if (isSlugExist != null){
				throw new BadRequestException('product name is already exist')
			}
		}
		
		if(input.code){
			if(!StringValidation(input.code)){
				throw new BadRequestException('product code must be string')
			}
			
			input.code = ForceToCode(input.code)
			
			const checkCode = await this.productModel.findOne({ _id: { $ne: checkProduct._id }, code: input.code})

			if (checkCode != null) {
				throw new BadRequestException('Product code is already exist.')
			}
		}

		// Check Topic ID
		if(input.topic){
			
			const getTopic = await this.topicModel.find({ _id: { $in: input.topic }})
			
			if(getTopic.length !== input.topic.length){
				throw new BadRequestException(`Topic not found`)
			}
		}

		// Check Agent (User) ID
		if(input.agent){
			const getAgent = await this.adminModel.find({ _id: { $in: input.agent }})
			
			if(getAgent.length !== input.agent.length){
				throw new BadRequestException(`Agent not found`)
			}
		}

		const valid = productValid(input)
		if(valid === 'webinar'){
			input.ecommerce = {}
		}else if(valid === 'ecommerce'){
			input.webinar = {}
		}else{
			input.ecommerce = {}
			input.webinar = {}
		}

		await this.productModel.findByIdAndUpdate(id, input);

		return await this.productModel.findById(id).exec();
	}
}
