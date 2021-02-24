import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IUserProducts } from './interfaces/userproducts.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { IProduct } from '../product/interfaces/product.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class UserproductsService {
    constructor(
		@InjectModel('UserProduct') private readonly userProductModel: Model<IUserProducts>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
	) {}

	private async BridgeTheContent(opt: any) {
		const objectIdValidTo = ["user_id", "product_id", "content_id", "topic", "modules.answer._id", "modules.mission_complete._id"]

		var {
			offset,
			limit,
			sortby,
			sortval,
			fields,
			value,
			is_user,
			user_id,
		} = opt;

		const offsets = offset == 0 ? offset : (offset - 1)
		const skip = offsets * limit
		const sortvals = (sortval == 'asc') ? 1 : -1

		console.log('opt', opt)

		if(objectIdValidTo.includes(fields)){
			if(typeof value === 'string'){
				if(!ObjectId.isValid(value)){
					throw new BadRequestException(`${fields} is invalid format to ObjectID`)
				}
				value = ObjectId(value)
			}
		}

		if(value === 'true'){
			value = true
		}

		if(value === 'false'){
			value = false
		}

		var sort: object = {}
		
		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = {}
		}
		
		var match:any = { [fields]: value }

		if(is_user === true || is_user === 'true'){
			match = { ...match, user_id: user_id }
		}
		
		
		console.log('match', match)
        // if(done === false || done === 'false'){
        //     match = { ...match, progress: { $lt:100 } }
        // }

        // if(done === true || done === 'true'){
        //     match = { ...match, progress: 100 }
        // }

        // if(done === undefined){
        //     match = { ...match }
        // }


		const query = await this.userProductModel.aggregate([
			{$match: match},
			{$lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
			}},
			{$unwind: {
					path: '$user',
					preserveNullAndEmptyArrays: true
			}},
			{$lookup: {
					from: 'products',
					localField: 'product_id',
					foreignField: '_id',
					as: 'product'
			}},
			{$unwind: {
					path: '$product',
					preserveNullAndEmptyArrays: true
			}},
			{$lookup: {
					from: 'contents',
					localField: 'content_id',
					foreignField: '_id',
					as: 'content'
			}},
			{$unwind: {
					path: '$content',
					preserveNullAndEmptyArrays: true
			}},
			{$lookup: {
					from: 'topics',
					localField: 'topic',
					foreignField: '_id',
					as: 'topic'
			}},
			{$lookup: {
					from: 'orders',
					localField: 'order_invoice',
					foreignField: 'invoice',
					as: 'order'
			}},
			{$unwind: {
				path: '$order',
				preserveNullAndEmptyArrays: true
			}},
			{$project: {
				"user._id":1,
				"user.name":1,
				"user.email":1,
				"user.phone_number":1,
				"product._id":1,
				"product.name":1,
				"product.slug":1,
				"product.code":1,
				"product.type":1,
				"product.visibility":1,
				"product.time_period":1,
				"utm":1,
				"content.title":1,
				"content.desc":1,
				"content.images":1,
				"content.podcast":1,
				"content.video":1,
				"content.thanks":1,
				"content.placement":1,
				"content.post_type":1,
				"content.series":1,
				"content.module":1,
				"topic._id":1,
				"topic.name":1,
				"topic.icon":1,
				"order.invoice":1,
				"order.payment":1,
				"progress": 1,
				"expired_date": 1,
				"create_date": 1,
				"expiry_date": 1
			}},
			// {$skip:Number(skip)},
			// {$limit:Number(limit)},
			// {$sort:sort}
		])

		console.log("in query 1", query)

		return query
	}

    async LMS_list(userId: string, options: OptQuery, done: any, as_user: any){

		var opt:any = options
		opt.user_id = userId
		opt.as_user = as_user

        const query = this.BridgeTheContent(opt)
        return query
    }

    async userProductDetail(userId: string, product_id: string) {
        const query = await this.userProductModel.findOne({user: userId, product: product_id})

        const product = await this.productModel.findOne({_id: product_id})

        if(!query || !product){
            throw new NotFoundException('product not found')
        }

        return product
    }

    async sendProgress(id: string, progress: number) {
		try {
			await this.productModel.findById(id)
		} catch (error) {
			throw new BadRequestException(`content with id ${id} not found`)
		}

		await this.productModel.findOneAndUpdate({_id: id}, {progress: progress})
		return `successfully changed the progress to ${progress}%`
	}
}
