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
import { TopicService } from '../../topic/topic.service';
import { AdministratorService } from '../../administrator/administrator.service';
import { OptQuery } from 'src/utils/OptQuery';
import { TimeValidation, DecimalValidation, StringValidation, UrlValidation } from 'src/utils/CustomValidation';

import {
	Slugify,
	ForceToCode
} from 'src/utils/StringManipulation';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ProductService {

	constructor(
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		private readonly topicService: TopicService,
		private readonly adminiService: AdministratorService
	) {}

	async create(userId: string, createProductDto: any): Promise<IProduct> {
		const result = new this.productModel(createProductDto)

		const {
			type,
			name,
			topic,
			agent,
			price,
			sale_price,
			webinar,
			ecommerce
		} = createProductDto

		const isNameExist = await this.productModel.findOne({ name: name })
		if(isNameExist){
			throw new BadRequestException('Name product is already exist')
		}

		/** Product Slug Start */
		var makeSlug = Slugify(name)
		if(createProductDto.slug){
			makeSlug = Slugify(createProductDto.slug)
		}
		
		const isSlugExist = await this.productModel.findOne({ slug: makeSlug })
		if (isSlugExist) {
			throw new BadRequestException('That product slug is already exist.')
		}
		result.slug = makeSlug
		/** Product Slug End */

		// Check Topic ID
		if(topic){
			var topicFound = new Array()
			for (let i = 0; i < topic.length; i++) {
				topicFound[i] = await this.topicService.findById(topic[i])
				if (!topicFound[i]) {
					throw new BadRequestException(`Topic Id [${i}] not found`)
				}

				//result.topic[i] = { id: topic[i], name: topicFound[i].name, icon: topicFound[i].icon }
			}

			result.topic = topic
		}

		// Check Agent (User) ID
		if(agent){
			var agentFound = new Array()
			for (let i = 0; i < agent.length; i++) {
				agentFound[i] = await this.adminiService.findById(agent[i])
				if (!agentFound[i]) {
					throw new BadRequestException(`Agent Id [${i}] not found`)
				}

				//result.agent[i] = { id: agent[i], name: agentFound[i].name }
			}

			result.agent = agent
		}

		/** Product Code Start */
		var makeCode = ForceToCode(name)

		if(createProductDto.code){
			makeCode = createProductDto.code
		}
		
		if(!StringValidation(makeCode)){
			throw new BadRequestException('product code must be string')
		}

		const checkCode = await this.productModel.findOne({ code: makeCode })
		if (checkCode) {
			throw new BadRequestException('Product code is already exist.')
		}

		result.code = makeCode

		/** Start Type Product Condition */
		if(type == 'webinar'){
			if(!webinar){
				throw new BadRequestException('value object (date, start_time, duration & client_url) in webinar is required')
			}

			if(!webinar.date){
				throw new BadRequestException('webinar date is required')
			}

			if(webinar.date && DecimalValidation(webinar.date)){
				throw new BadRequestException('webinar date must be date type or string')
			}

			if(!webinar.start_time){
				throw new BadRequestException('webinar start_time is required')
			}

			if(webinar.start_time && !TimeValidation(webinar.start_time)){
				throw new BadRequestException('webinar start_time, wrong format, ex: 10:30')
			}

			if(!webinar.duration){
				throw new BadRequestException('webinar duration is required')
			}

			if(webinar.duration && !TimeValidation(webinar.duration)){
				throw new BadRequestException('webinar duration, wrong format, ex: 30:00')
			}

			if(!webinar.client_url){
				throw new BadRequestException('webinar client_url is required')
			}

			if(webinar.client_url && !UrlValidation(webinar.client_url)){
				throw new BadRequestException('webinar client_url, wrong format, ex: http://www.client_url.com')
			}
		}

		if(type == 'ecommerce'){

			if(!ecommerce){
				throw new BadRequestException('value object (stock) in ecommerce is required, field ecommerce.shipping_charges & ecommerce.weight is optional')
			}

			if(ecommerce.weight && !DecimalValidation(ecommerce.weight)){
				throw new BadRequestException('ecommerce weight must be number (decimal)')
			}

			if(!ecommerce.shipping_charges){
				ecommerce.shipping_charges = false
			}

			if(ecommerce.shipping_charges != false && ecommerce.shipping_charges != true){
				throw new BadRequestException('ecommerce shipping_charges must be true or false')
			}

			if(!ecommerce.stock){
				throw new BadRequestException('ecommerce stock is required')
			}

			if(ecommerce.stock && !DecimalValidation(ecommerce.stock)){
				throw new BadRequestException('ecommerce stock must be number (decimal)')
			}
		}
		/** End Type Product Condition */

		/** Start Price and Sale Price*/
		if(price && !DecimalValidation(price)){
			throw new BadRequestException('Price must be number (decimal)')
		}

		if(sale_price){
			if(!DecimalValidation(sale_price)){
				throw new BadRequestException('Sale price must be number (decimal)')
			}

			if(sale_price >= price){
				throw new BadRequestException('the discount (sale_price) must be smaller than the regular price')
			}
		}
		/** End Price */

		/** Start Created At */
		if (userId) {

			const checkUser = await this.adminiService.findById(userId)
			if (!checkUser) {
				throw new BadRequestException(`User/Administrators [${userId}] in created_at not found`)
			}

			result.created_by = userId
		}
		/** Start Created At */

		return await result.save()
	}

	async update(id: string, input: any, userId: string): Promise<IProduct> {
		// Check Id
		const checkProduct = await this.productModel.findById(id);

		if (!checkProduct) {
			throw new NotFoundException(`Could nod find product with id ${id}`);
		}

		var {
			type,
			topic,
			agent,
			price,
			sale_price,
			webinar,
			ecommerce,
		} = input

		var result = new this.productModel(input)
		result._id = id

		result.name = (!input.name) ? checkProduct.name : input.name

		/** Product Slug Start */
		var makeSlug = Slugify(result.name)
		if (result.slug) {
			makeSlug = Slugify(result.slug)
		}
		
		const isSlugExist = await this.productModel.findOne({ slug: makeSlug })
		if (isSlugExist && isSlugExist._id != id && isSlugExist.slug == makeSlug) {
			throw new BadRequestException('That product slug is already exist.')
		}
		
		result.slug = makeSlug
		/** Product Slug End */

		/** Product Code Start */
		var makeCode = ForceToCode(result.name)

		if(input.code){
			makeCode = ForceToCode(input.code)
		}
		
		if(!StringValidation(makeCode)){
			throw new BadRequestException('product code must be string')
		}

		const checkCode = await this.productModel.findOne({ code: makeCode })

		if (checkCode && checkCode._id != id && checkCode.code == makeCode) {
			throw new BadRequestException('Product code is already exist.')
		}
		result.code = makeCode
		/** Product Code End */

		// Check Topic ID
		var topicFound = new Array()
		if (topic) {
			for (let i = 0; i < topic.length; i++) {
				topicFound[i] = await this.topicService.findById(topic[i])
				if (!topicFound[i]) {
					throw new BadRequestException(`Topic Id [${i}] not found`)
				}

				//result.topic[i] =  { id: topic[i], name: topicFound[i].name, icon: topicFound[i].icon }
			}

			result.topic = topic
		}

		// Check Agent (User) ID
		var agentFound = new Array()
		if (agent) {
			for (let i = 0; i < agent.length; i++) {
				agentFound[i] = await this.adminiService.findById(agent[i])
				if (!agentFound[i]) {
					throw new BadRequestException(`Agent Id [${i}] not found`)
				}

				//result.agent[i] = { id: agent[i], name: agentFound[i].name}
			}

			result.agent = agent
		}

		/** Start Price and Sale Price*/
		if (price && !DecimalValidation(price)) {
			throw new BadRequestException('Price must be number (decimal)')
		}

		if(sale_price){
			if(!DecimalValidation(sale_price)){
				throw new BadRequestException('Sale price must be number (decimal)')
			}

			if(sale_price >= price){
				throw new BadRequestException('the discount (sale_price) must be smaller than the regular price')
			}
		}

		/** Start Updated At */
		if (userId) {
			const checkUser = await this.adminiService.findById(userId)
			if (!checkUser) {
				throw new BadRequestException(`User/Administrators [${userId}] in created_at not found`)
			}
			result.updated_by = userId
		}
		/** Start Updated At */

		/** Start Type Product Condition */
		if(type && type == 'webinar'){
			if(!webinar){
				throw new BadRequestException('value object (date, start_time, duration & client_url) in webinar is required')
			}

			if(!webinar.date){
				throw new BadRequestException('webinar date is required')
			}

			if(webinar.date && DecimalValidation(webinar.date)){
				throw new BadRequestException('webinar date must be date type or string')
			}

			if(!webinar.start_time){
				throw new BadRequestException('webinar start_time is required')
			}

			if(webinar.start_time && !TimeValidation(webinar.start_time)){
				throw new BadRequestException('webinar start_time, wrong format, ex: 10:30')
			}

			if(!webinar.duration){
				throw new BadRequestException('webinar duration is required')
			}

			if(webinar.duration && !TimeValidation(webinar.duration)){
				throw new BadRequestException('webinar duration, wrong format, ex: 30:00')
			}

			if(!webinar.client_url){
				throw new BadRequestException('webinar client_url is required')
			}

			if(webinar.client_url && !UrlValidation(webinar.client_url)){
				throw new BadRequestException('webinar client_url, wrong format, ex: http://www.client_url.com')
			}
		}

		if(type && type == 'ecommerce'){

			if(!ecommerce){
				throw new BadRequestException('value object (stock) in ecommerce is required, field ecommerce.shipping_charges & ecommerce.weight is optional')
			}

			if(ecommerce.weight && !DecimalValidation(ecommerce.weight)){
				throw new BadRequestException('ecommerce weight must be number (decimal)')
			}

			if(!ecommerce.shipping_charges){
				ecommerce.shipping_charges = false
			}

			if(ecommerce.shipping_charges != false && ecommerce.shipping_charges != true){
				throw new BadRequestException('ecommerce shipping_charges must be true or false')
			}

			if(!ecommerce.stock){
				throw new BadRequestException('ecommerce stock is required')
			}

			if(ecommerce.stock && !DecimalValidation(ecommerce.stock)){
				throw new BadRequestException('ecommerce stock must be number (decimal)')
			}
		}
		/** End Type Product Condition */

		await this.productModel.findByIdAndUpdate(
			id,
			{ $set: result },
			{ new: true, upsert: true }
	        );

		return await this.productModel.findById(id).exec();
	}
}
