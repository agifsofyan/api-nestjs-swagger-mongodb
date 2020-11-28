import {
	Injectable,
	NotFoundException,
	NotImplementedException
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IProduct } from '../interfaces/product.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { IOrder } from 'src/modules/order/interfaces/order.interface';
import { ICoupon } from 'src/modules/coupon/interfaces/coupon.interface';
import { IContent } from 'src/modules/content/interfaces/content.interface';
import { StrToUnix } from 'src/utils/StringManipulation';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ProductCrudService {

	constructor(
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Order') private orderModel: Model<IOrder>,
		@InjectModel('Coupon') private couponModel: Model<ICoupon>,
		@InjectModel('Content') private contentModel: Model<IContent>,
    ) {}
    
    async findAll(options: OptQuery) {
		return await this.productModel.find()
	}

	async findById(id: string): Promise<IProduct> {
	 	let result
		try{
			result = await this.productModel.findOne({ _id: id })
		}catch(error){
		    throw new NotFoundException(`Could nod find product with id ${id}`)
		}

		if(!result){
			throw new NotFoundException(`Could nod find product with id ${id}`)
		}

		return result
	}

	async findBySlug(slug: string): Promise<IProduct> {
		let result
		try{
			result = await this.productModel.findOne({slug: slug})
	   	}catch(error){
		   throw new NotFoundException(`Could nod find product with slug ${slug}`)
	   	}

	   	if(!result){
		   throw new NotFoundException(`Could nod find product with slug ${slug}`)
	   	}

	   	return result
   }

	async delete(id: string): Promise<string> {
		try{
			await this.productModel.findByIdAndRemove(id).exec();
			return 'ok'
		}catch(err){
			throw new NotImplementedException('The product could not be deleted')
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try {
			await this.productModel.deleteMany({ _id: { $in: arrayId } });
			return 'ok';
		} catch (err) {
			throw new NotImplementedException('The product could not be deleted');
		}
	}

	async search(value: any): Promise<IProduct[]> {

		const result = await this.productModel.find({ $text: { $search: value.search } })

		if (!result) {
			throw new NotFoundException("Your search was not found")
		}

		return result
	}

	async insertMany(value: any, userId: any) {
		const arrayId = value.id
		const now = new Date()
		const copy = `COPY-${StrToUnix(now)}`
			
		var found = await this.productModel.find({ _id: { $in: arrayId } })
		for(let i in found){
			found[i]._id = new ObjectId()
			found[i].name = `${found[i].name}-${copy}`
			found[i].slug = `${found[i].slug}-${copy}`
			found[i].code = `${found[i].code}-${copy}`
			found[i].created_by = userId
			found[i].updated_by = null
		}
		
		try {
			return await this.productModel.insertMany(found);
		} catch (e) {
			throw new NotImplementedException(`The product could not be cloned`);
		}
	}

	async ProductCountList() {
        const product = await this.productModel.find()

        var count = new Array()
        var result = new Array()
        for(let i in product){
            count[i] = {
                order: await this.orderModel.find({ "items.product_info": product[i]._id}).countDocuments(),
                coupon: await this.couponModel.find({ "product_id": product[i]._id}).countDocuments(),
                content: await this.contentModel.find({ "product": product[i]._id }).countDocuments()
            }

            result[i] = {
                product: product[i],
                count: count[i]
            }
        }
        return result
    }
}
