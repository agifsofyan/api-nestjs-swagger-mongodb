import {
	Injectable,
	NotFoundException,
	BadRequestException,
	NotImplementedException
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProduct } from '../interfaces/product.interface';
import { ITopic } from '../../topic/interfaces/topic.interface';
import { IAdmin } from '../../administrator/interfaces/admin.interface';
import { 
	StringValidation, 
	productValid,
	UrlValidation,
	videoExValidation,
	imgExValidation
} from 'src/utils/CustomValidation';

import {
	Slugify,
	ForceToCode,
	ReCode
} from 'src/utils/StringManipulation';
import { TagService } from 'src/modules/tag/tag.service';

@Injectable()
export class ProductService {

	constructor(
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
		@InjectModel('Admin') private readonly adminModel: Model<IAdmin>,
		private readonly tagService: TagService
	) {}

	async create(userId: any, input: any): Promise<IProduct> {
		const {
			name,
			topic,
			agent,
			tag,
			media
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
			if(!StringValidation(makeCode)){
				throw new BadRequestException('product code must be string')
			}
		}

		const checkCode = await this.productModel.findOne({ code: {$regex: makeCode, $options: 'i'} }).sort({ code: -1  })
		if (checkCode) {
			var reCode = ReCode(checkCode.code)
			input.code = reCode
		}else{
			input.code = makeCode
		}

		const valid = productValid(input)
		if(valid === 'boe'){
			delete input.ecommerce
		}else if(valid === 'ecommerce'){
			input.time_period = 0
			delete input.boe
		}else if(valid === 'bonus'){
			if(input.price) input.price = 0;
			if(input.sale_price) input.sale_price = 0;

			delete input.ecommerce
			delete input.boe
		}else{
			delete input.ecommerce
			delete input.boe
		}
		
		const result = new this.productModel(input)

		if(tag){
			const tags = input.tag.map(tag => {
				const tagObj = {name: tag, coupon: result._id}
				return tagObj
			})

			const hashtag = await this.tagService.insertMany(tags).then(res => res.map(val => val._id))

			input.tag = hashtag
		}

		var bumps = []

		if(input.bump){
			input.bump.map(res => {
				if(res.bump_name && res.bump_name != "" && res.bump_name != null || res.bump_name != undefined){
					bumps.push(res)
				}
			})
		}

		result.bump = bumps

		if(media){
			if(media.isVideo == undefined || media.isVideo == null) throw new BadRequestException('media.isVideo is required');
			if(!media.url) throw new BadRequestException('media.url is required');

			const urlValid = UrlValidation(media.url)
			if(!urlValid) throw new BadRequestException('media.url not valid');

			if(media.isVideo == true){
				const videoValid = videoExValidation(media.url)
				if(!videoValid) throw new BadRequestException('media format not valid to video extention');
			}else{
				const imgValid = imgExValidation(media.url)
				if(!imgValid) throw new BadRequestException('media format not valid to image extention');
			}
		}

		result.media = media
		
		await result.save()

		return result  

	}

	async update(id: string, input: any, userId: any): Promise<IProduct> {
		// Check Id
		const checkProduct = await this.productModel.findById(id);

		if (!checkProduct) {
			throw new NotFoundException(`Could nod find product with id ${id}`);
		}
		
		input.updated_at = userId

		if(input.name){
			/** Product Slug Start */
			input.slug = Slugify(input.name)
			if(input.slug){
				input.slug = Slugify(input.slug)
			}
			
			const isSlugExist = await this.productModel.findOne({ _id: { $ne: checkProduct._id }, slug: input.slug})
			if (isSlugExist != null){
				throw new BadRequestException('product name is already exist')
			}

			/** Product Code Start */
			var makeCode = ForceToCode(input.name)

			const checkCode = await this.productModel.findOne({ code: {$regex: makeCode, $options: 'i'} }).sort({ code: -1  })
			// console.log('checkCode in front', checkCode)
			if (checkCode) {
				var reCode = ReCode(checkCode.code)
				input.code = reCode
			}else{
				input.code = makeCode
			}
		}
		
		if(input.code){
			var makeCode = input.code
			if(!StringValidation(makeCode)){
				throw new BadRequestException('product code must be string')
			}
			
			/** Product Code Start */
			var makeCode = ForceToCode(input.name)

			const checkCode = await this.productModel.findOne({ code: {$regex: makeCode, $options: 'i'} }).sort({ code: -1  })
			// console.log('checkCode in front', checkCode)
			if (checkCode) {
				var reCode = ReCode(checkCode.code)
				input.code = reCode
			}else{
				input.code = makeCode
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
		if(valid === 'boe'){
			delete input.ecommerce
		}else if(valid === 'ecommerce'){
			delete input.boe
		}else if(valid === 'bonus'){
			if(input.price) input.price = 0;

			if(input.sale_price)input.sale_price = 0;

			delete input.ecommerce
			delete input.boe
		}else{
			delete input.ecommerce
			delete input.boe
		}

		var bumps = []

		if(input.bump){
			input.bump.map(res => {
				if(res.bump_name && res.bump_name != "" && res.bump_name != null || res.bump_name != undefined){
					bumps.push(res)
				}
			})
		}

		input.bump = bumps

		if(input.media){
			if(input.media.isVideo == null || input.media.isVideo == undefined) throw new BadRequestException('media.isVideo is required');

			const urlValid = UrlValidation(input.media.url)
			if(!urlValid) throw new BadRequestException('media.url not valid');

			if(input.media.isVideo == true){
				const videoValid = videoExValidation(input.media.url)
				if(!videoValid) throw new BadRequestException('media format not valid to video extention');
			}else{
				const imgValid = imgExValidation(input.media.url)
				if(!imgValid) throw new BadRequestException('media format not valid to image extention');
			}
		}

		await this.productModel.findByIdAndUpdate(id, input);
		return await this.productModel.findById(id).exec();
	}
}
