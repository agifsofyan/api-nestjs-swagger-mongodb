import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IHashTag } from '../hashtag/interfaces/hashtag.interface';
import { ArrStrToObjectId, arrInArr, onArray } from 'src/utils/StringManipulation';

@Injectable()
export class HashTagService {

	constructor(
		@InjectModel('HashTag') private readonly tagModel: Model<IHashTag>
	) {}

	async insertOne(input: any): Promise<IHashTag> {
		const { name, product, content, order, coupon } = input
		const toName = name.split(" ").join("_").toLowerCase()
		
		// Check if hashtag if already exist
		const havetag = await this.tagModel.findOne({ name: toName });
		console.log('havetag', havetag)
		
		if (havetag) {
			if(product && havetag.product.length >= 1){
				console.log('if 1')
				const productId = onArray(product, havetag.product)
				havetag.product.push(...productId)
			}else if(content && havetag.content.length >= 1){
				console.log('if 2')
				const contendId = onArray(content, havetag.content)
				havetag.content.push(...contendId)
			}else if(order && havetag.order.length >= 1){
				console.log('if 3')
				const orderId = onArray(order, havetag.order)
				havetag.order.push(...orderId)
			}else if(coupon && havetag.coupon.length >= 1){
				console.log('if 4')
				const couponId = onArray(coupon, havetag.coupon)
				havetag.coupon.push(...couponId)
			}else{
				console.log('in else')
				havetag.product = input.product
				havetag.content = input.content
				havetag.order = input.order
				havetag.coupon = input.coupon
			}

			return await havetag.save();
		}else{
			input.name = toName

			// console.log('input if null', input)

			// if(product){
			// 	input.product = ArrStrToObjectId(product)
			// }

			// if(content){
			// 	input.content = ArrStrToObjectId(content)
			// }

			// if(order){
			// 	input.order = ArrStrToObjectId(order)
			// }

			// if(coupon){
			// 	input.coupon = ArrStrToObjectId(coupon)
			// }

			const query = new this.tagModel(input);
			return await query.save();
		}
	}

	async insertMany(input: any){
		const tags = input.map(async (input) => {
			const toName = (input.name).split(" ").join("_").toLowerCase()
			// Check if hashtag if already exist
			const isHashtagNameExist = await this.tagModel.findOne({ name: toName });
			
			if (isHashtagNameExist) {
				throw new BadRequestException('That hashtag name is already exist.');
			}

			input.name = toName
			return input
		})
		
		const result = await Promise.all(tags)
		
		const query = await this.tagModel.insertMany(result);
		return query
	}

	async findAll(options?: any): Promise<IHashTag[]> {
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

	async findOne(field: any, value: any): Promise<IHashTag> {
	 	let result;
		try{
		    result = await this.tagModel.findOne({[field]: value});
		}catch(error){
		    throw new NotFoundException(`Could nod find hashtag with ${field} ${value}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find hashtag with ${field} ${value}`);
		}

		return result;
	}

	async update(id: string, input: any): Promise<IHashTag> {
		let result;
		
		// Check ID
		try{
		    result = await this.tagModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find hashtag with id ${id}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find hashtag with id ${id}`);
		}

		const initialName = input.name
		const toName = initialName.split(" ").join("_").toLowerCase()
		input.name = toName

		try {
			await this.tagModel.findByIdAndUpdate(id, input);
			return await this.tagModel.findById(id).exec();
		} catch (error) {
			throw new Error(error)
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.tagModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The hashtag could not be deleted');
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try{
			await this.tagModel.deleteMany({ _id: {$in: arrayId} });
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The hashtag could not be deleted');
		}
	}

	async pullSome(name: string, type: string, id: any){
		name = name.split(" ").join("_").toLowerCase()
		const isArray = id instanceof Array
		if(!isArray){
			id = [id]
		}

		const checkTag = await this.tagModel.findOne({name: name})

		if(!checkTag){
			throw new BadRequestException('hashtag name not found')
		}

		const inType = ['product', 'content', 'order', 'coupon']
		if(!inType.includes(type)){
			throw new BadRequestException('hashtag type not found')
		}

		await this.tagModel.findOneAndUpdate(
			{name: name},
			{ $pull: { [type]: { $in: id } } }
		)
	}
}
