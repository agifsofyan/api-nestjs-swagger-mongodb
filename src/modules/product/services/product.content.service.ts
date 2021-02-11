import {
	Injectable,
	NotFoundException,
	BadRequestException
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProduct } from '../interfaces/product.interface';
import * as moment from 'moment';

@Injectable()
export class ProductContentService {

	constructor(
		@InjectModel('Product') private readonly productModel: Model<IProduct>
	) {}

	async productInTheSameTime() {
		const now = moment(new Date()).format('Y-MM-DD')
		const hourNow = moment(new Date()).format('H:MM')
		console.log('now', now)
		console.log('hourNow', hourNow)
		const query = await this.productModel.find({
			"boe.date": now,
			"boe.start_time": hourNow
		})
		console.log('counter', query.length)
		return query
	}
}

// export const UnixToStr = (unix) => moment(unix).format('HH:mm')
// 2021-02-28
// 2021-02-05