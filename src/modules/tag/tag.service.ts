import { 
	Injectable, 
	NotFoundException, 
	BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IOrder } from '../order/interfaces/order.interface';
import { ITag } from './interfaces/tag.interface';

@Injectable()
export class TagService {

	constructor(
		@InjectModel('Tag') private readonly tagModel: Model<ITag>,
		@InjectModel('Order') private readonly orderModel: Model<IOrder>,
	) {}

	async insertMany(input: any) {
		input = input.map(form => {
			form.name = form.name.split(" ").join("_").toLowerCase()
			return form
		})
		
		var hashtags = new Array()
		for(let i in input){
			console.log(input[i].order)
			var pushTag = {}

			if(input[i].product){
				pushTag = { product: input[i].product }
			}

			if(input[i].order){
				pushTag = { order: input[i].order }
			}

			if(input[i].content){
				pushTag = { content: input[i].content }
			}

			if(input[i].coupon){
				pushTag = { coupon: input[i].coupon }
			}

			hashtags[i] = await this.tagModel.findOneAndUpdate(
				{name: input[i].name},
				{name: input[i].name, $push: pushTag},
				{upsert: true, new: true, runValidators: true}
			)
		}

		return hashtags
	}

	async findAll(options?: any): Promise<ITag[]> {
		const sortval = (options.sort == 'asc') ? 1 : -1;

		var match = {}
		var sort = {}
		if (options.name) {
			match = { "name": options.name }
		}

		if(options.sort){
			sort = { "name": sortval }
		}else{
			sort = { "created_at": 1 }
		}

		var query = await this.tagModel.aggregate([
			{ $match: match},
			{ $sort: sort}
		])

		return query
	}

	async findOne(field: any, value: any): Promise<ITag> {
	 	let result;
		try{
		    result = await this.tagModel.findOne({[field]: value});
		}catch(error){
		    throw new NotFoundException(`Could nod find Tag with ${field} ${value}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find Tag with ${field} ${value}`);
		}

		return result;
	}

	async pullSome(name: string, type: string, id: any){
		name = name.split(" ").join("_").toLowerCase()
		const isArray = id instanceof Array
		if(!isArray){
			id = [id]
		}

		const checkTag = await this.tagModel.findOne({name: name})

		if(!checkTag){
			throw new BadRequestException('Tag name not found')
		}

		const inType = ['product', 'content', 'order', 'coupon']
		if(!inType.includes(type)){
			throw new BadRequestException('Tag type not found')
		}

		await this.tagModel.findOneAndUpdate(
			{name: name},
			{ $pull: { [type]: { $in: id } } }
		)
	}

	async findUTM(options?: any) {
		var match = {}
		
		if (options.user_id) {
			match = { "user_info": options.user_id }
		}

		var query = await this.orderModel.find(match)
		.then(res => {
			return res.filter(el => {

				if(options._id){
					return (el._id).toString() === options._id
				}

				return el.items.find(val => {
					if(options.utm){
						return val.utm === options.utm
					}

					if(options.product_id){
						return (val.product_info).toString() === options.product_id
					}

					return val
				})

			})
			.map(res => {
				const items = res.items.filter(val => val)
				var result = items[0]

				return {
					_id: res._id,
					user_id: res.user_info,
					product_id: result.product_info,
					utm: result.utm
				}
			})
		})

		return query
	}
}
