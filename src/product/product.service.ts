import { Injectable, Param, Res, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IProduct } from './interfaces/product.interface';
import { OptQuery } from '../utils/optquery';
// import { prepareProduct } from '../utils';

@Injectable()
export class ProductService {
    constructor(@InjectModel('Product') private productModel: Model<IProduct>) {}

    async filter(options: OptQuery): Promise<IProduct[]> {
        const { offset, limit, fields, sortby, sortval, value } = options;

		const offsets = (offset == 0 ? offset : (offset - 1));
		const skip = offsets * limit;
		const sortvals = (sortval == 'asc') ? 1 : -1;

		if (sortby) {
			return await this.productModel
				.find({ $and: [ { [fields]: new RegExp(value, 'i') }, { visibility: 'publish' } ]})
				.skip(Number(skip))
				.limit(Number(limit))
				.sort({ [sortby]: sortvals })
				.populate({ path: 'product_redirect', populate: { path: 'topic' }})
				.exec();
		} else {
			return await this.productModel
				.find({ $and: [ { [fields]: new RegExp(value, 'i') }, { visibility: 'publish' } ]})
				.skip(Number(skip))
				.limit(Number(limit))
				.populate({ path: 'product_redirect', populate: { path: 'topic' }})
				.exec();
		}
	}
	
	async fetch(): Promise<IProduct[]> {
		const products = await this.productModel.find({})
			.populate({ path: 'product_redirect' })
			.sort('-created_at');
		return products;
	}

    async search(query: any): Promise<string[]> {
		const { product, topic } = query;
		if (topic) {
			const products = await this.productModel.find({ $and: [
				{ 'topic.name': new RegExp(topic, 'i') },
				{ visibility: 'publish' }
			] });
			return products.map((product: any) => product);
		}
		const products = await this.productModel.find({ $and: [
			{ slug: new RegExp(product, 'i') }, 
			{ visibility: 'publish' }
		]});
		return products.map((product: any) => product);
	}

	async findBySlug(@Param('slug') slug: string)  {
		let result
		try{
			result = await this.productModel.findOne({slug:slug})
				.populate('created_by', ['_id', 'name'])
				.populate('updated_by', ['_id', 'name'])
		}catch(error){
		    throw new NotFoundException(`Could nod find product with slug ${slug}`)
		}

		if(!result){
			throw new NotFoundException(`Could nod find product with slug ${slug}`)
		}

		return result
	}

	// async rating(id: string, rating: CreateRatingDTO): Promise<IProduct> {
	// 	const checkId = await this.productModel.findById(id)

	// 	if(!checkId){
	// 		throw new NotFoundException('Product Id not found')
	// 	}

	// 	await this.productModel.findByIdAndUpdate(id, rating)

	// 	return await this.productModel.findById(id)
	// }
}
