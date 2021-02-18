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
	productValid
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
			feature
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
			const getDate = input.boe.date
			const onlyDate = getDate.split("T")
			const firstDate = onlyDate[0].split("-")
			const firstTime = input.boe.start_time.split(":")

			// From Start Time [change hour to minute]
			const hourToMinute1 = Number(firstTime[0]) * 60 // in minute
			const minute1 = Number(firstTime[1])

			const durate = input.boe.duration.split(":")
			const hourToMinute2 = Number(durate[0]) * 60 // in minute
			const minute2 = Number(durate[1])

			const totalMinute1 = hourToMinute1 + hourToMinute2
			const totalMinute2 = minute1 + minute2
			
			const ttlHour = (totalMinute2 % 60 === 0 ? totalMinute1 + 1 : totalMinute1)
			const ttlMinute = (totalMinute2 % 60 === 0 ? 0 : totalMinute2)

			// input.boe.beginTime = new Date(firstDate[0], Number(firstDate[1]) - 1, firstDate[2], firstTime[0], firstTime[1])
			// input.boe.endTime = new Date(firstDate[0], Number(firstDate[1]) - 2, firstDate[2], ttlHour, ttlMinute)

			input.boe.beginTime = new Date(getDate).setHours(firstTime[0], firstTime[1])
			input.boe.endTime = new Date(firstDate[0], Number(firstDate[1]) - 2, firstDate[2], ttlHour, ttlMinute)
			console.log('boe.endTime', input.boe.endTime)
			input.ecommerce = new Object()
		}else if(valid === 'ecommerce'){
			input.time_period = 0
			input.boe = new Object()
		}else{
			input.ecommerce = new Object()
			input.boe = new Object()
		}

		var activeHead = true
		if(!feature.active_header || feature.active_header == false || feature.active_header === 'false'){
			activeHead = false
		}

		input.feature.active_header = activeHead

		var activeBody = true
		if(!feature.active_page || feature.active_page == false || feature.active_page === 'false'){
			activeBody = false
		}

		input.feature.active_page = activeBody
		
		const result = new this.productModel(input)

		if(tag){
			const tags = input.tag.map(tag => {
				const tagObj = {name: tag, coupon: result._id}
				return tagObj
			})

			const hashtag = await this.tagService.insertMany(tags).then(res => res.map(val => val._id))

			input.tag = hashtag
		}

		console.log('input boe', input.boe)
		console.log('boe', result.boe)
		
		// await this.productModel.updateMany(
		// 	{},
		// 	{ "feature.active_header": !activeHead, "feature.active_page": !activeBody },
		// 	{ upsert: true, new: true }
		// )
		
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
			const firstDate = input.boe.date.split("-")
			const firstTime = input.boe.start_time.split(":")

			// From Start Time [change hour to minute]
			const hourToMinute1 = Number(firstTime[0]) * 60 // in minute
			const minute1 = Number(firstTime[1])

			const durate = input.boe.duration.split(":")
			const hourToMinute2 = Number(durate[0]) * 60 // in minute
			const minute2 = Number(durate[1])

			const totalMinute1 = hourToMinute1 + hourToMinute2
			const totalMinute2 = minute1 + minute2
			
			const ttlHour = (totalMinute2 % 60 === 0 ? totalMinute1 + 1 : totalMinute1)
			const ttlMinute = (totalMinute2 % 60 === 0 ? 0 : totalMinute2)

			input.boe.beginTime = new Date(firstDate[0], Number(firstDate[1]) - 1, firstDate[2], firstTime[0], firstTime[1])
			input.boe.endTime = new Date(firstDate[0], Number(firstDate[1]) - 2, firstDate[2], ttlHour, ttlMinute)
			input.ecommerce = {}
		}else if(valid === 'ecommerce'){
			input.boe = {}
		}else{
			input.ecommerce = {}
			input.boe = {}
		}

		// ****
		const { feature } = input
		var activeHead = false
		if(feature.active_header == true || feature.active_header === 'true'){
			activeHead = true
		}

		input.feature.active_header = activeHead

		var activeBody = false
		if(feature.active_page == true || feature.active_page === 'true'){
			activeBody = true
		}

		input.feature.active_page = activeBody

		if(activeHead === true && activeBody === true){
			await this.productModel.updateMany(
				{ _id: { $nin: id }, "feature.active_header": activeHead, "feature.active_page": activeBody },
				{ "feature.active_header": !activeHead, "feature.active_page": !activeBody },
				{ upsert: true, new: true, multi: true }
			)
		}

		await this.productModel.findByIdAndUpdate(id, input);
		return await this.productModel.findById(id).exec();
	}
}
