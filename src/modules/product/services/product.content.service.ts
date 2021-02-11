import {
	Injectable,
	NotFoundException,
	BadRequestException
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProduct } from '../interfaces/product.interface';
import * as moment from 'moment';
import { OptQuery } from 'src/utils/OptQuery';

@Injectable()
export class ProductContentService {

	constructor(
		@InjectModel('Product') private readonly productModel: Model<IProduct>
	) {}

	async productInTheSameTime(options: OptQuery) {
		const {
			offset,
			limit,
			sortby,
			sortval
		} = options;

		const offsets = offset == 0 ? offset : (offset - 1)
		const skip = offsets * limit
		const sortvals = (sortval == 'asc') ? 1 : -1
		
		var sort: object = {}
		
		if (sortby){
			sort = { [sortby]: sortvals }
		}else{
			sort = { 'created_at': -1 }
		}

		const now = new Date()
		const nowmoment = moment(now).format('Y-MM-DD')
		
		const query = await this.productModel.aggregate([
			{$set: {beginDate: "$boe.beginDate"}},
			{$match: {
				"boe.date": nowmoment,
				"boe.beginTime": {
					$lte: now
				},
				"boe.endTime": {
					$gt: now
				},
			}},
			{$limit: !limit ? await this.productModel.countDocuments() : Number(limit)},
			{$skip: Number(skip)},
			{$sort: sort}
		])
		return query
	}
}