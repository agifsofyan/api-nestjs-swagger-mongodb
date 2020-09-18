import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IProduct } from './interfaces/product.interface';
import { OptQuery } from '../utils/optquery';

@Injectable()
export class ProductService {
    constructor(@InjectModel('Product') private productModel: Model<IProduct>) {}

    async fetch(options: OptQuery): Promise<IProduct> {
        const { offset, limit, fields, sortby, sortval, value } = options;

		const offsets = (offset == 0 ? offset : (offset - 1));
		const skip = offsets * limit;
		const sortvals = (sortval == 'asc') ? 1 : -1;

		if (sortby) {
			if (fields) {
				return await this.productModel
					.find({ visibility: 'publish' }, { $where: `/^${value}.*/.laruno(this.${fields})` })
					.populate('topic')
					.skip(Number(skip))
					.limit(Number(limit))
					.sort({ [sortby]: sortvals })
					.exec();
			} else {
				return await this.productModel
					.find({ visibility: 'publish' })
					.populate('topic')
					.skip(Number(skip))
					.limit(Number(limit))
					.sort({ [sortby]: sortvals })
					.exec();
			}
		} else {
			if (fields) {
				return await this.productModel
					.find({ visibility: 'publish' }, { $where: `/^${value}.*/.laruno(this.${fields})` })
					.populate('topic')
					.skip(Number(skip))
					.limit(Number(limit))
					.exec();
			} else {
				return await this.productModel
					.find({ visibility: 'publish' })
					.populate('topic')
					.skip(Number(skip))
					.limit(Number(limit))
					.exec();
			}
		}
    }

    async search(query: any): Promise<IProduct> {
		const { product, topic } = query;
		if (topic) {
			const products = await this.productModel.find({ $and: [
				{ slug: new RegExp(product, 'i') },
				{ visibility: 'publish' }
			] }).populate(
				{ 
					path: 'topic', 
					match: { name: topic },
					select: ['name', 'slug']
				}).exec();
			return products.filter((product: any) => product);
		}
		const products = await this.productModel.find({ $and: [
			{ slug: new RegExp(product, 'i') }, 
			{ visibility: 'publish' }
		]}).populate('topic');
		return products;
	}
}
