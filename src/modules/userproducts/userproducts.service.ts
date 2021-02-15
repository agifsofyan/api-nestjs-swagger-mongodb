import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserProducts } from './interfaces/userproducts.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { IProduct } from '../product/interfaces/product.interface';

@Injectable()
export class UserproductsService {
    constructor(
		@InjectModel('UserProduct') private readonly userProductModel: Model<IUserProducts>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
	) {}

    async userList(userId: string, options: OptQuery, done: any){
        const {
			offset,
			limit,
			sortby,
			sortval,
			fields,
			value
		} = options;

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
		var match: object = {user: userId}

		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { 'updated_at': -1 }
		}

        if(fields && value){
            match = { ...match, [fields]: resVal }
        }

        if(done === false || done === 'false'){
            match = { ...match, progress: { $lt:100 } }
        }

        if(done === true || done === 'true'){
            match = { ...match, progress: 100 }
        }

        if(done === undefined){
            match = { ...match }
        }

        const query =  await this.userProductModel.find(match).skip(Number(skip)).limit(Number(limit)).sort(sort)
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
