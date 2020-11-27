import { 
    BadRequestException,
    Injectable, NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IPaymentMethod as IPM } from './interfaces/payment.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { ICoupon } from 'src/modules/coupon/interfaces/coupon.interface';
import { IOrder } from 'src/modules/order/interfaces/order.interface';

@Injectable()
export class PaymentMethodService {
    constructor(
		@InjectModel('PaymentMethod') private readonly payMethodModel: Model<IPM>,
		@InjectModel('Coupon') private readonly couponModel: Model<ICoupon>,
		@InjectModel('Order') private readonly orderModel: Model<IOrder>
    ) {}

    async insert(input: any){
		const name = String(input.name)
		input.name = name.toUpperCase()

        const checkPM = await this.payMethodModel.findOne({ name: input.name })

        if(checkPM){
            throw new BadRequestException('method name is already exists')
        }

        const query = new this.payMethodModel(input)

        await query.save()

        return query
    }

    async getAll(options: OptQuery): Promise<IPM[]>{
        const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
		const skip = offset * options.limit;
		const sortval = (options.sortval == 'asc') ? 1 : -1;

		if (options.sortby){
			if (options.fields) {

				return await this.payMethodModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.exec();

			} else {

				return await this.payMethodModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.exec();

			}
		}else{
			if (options.fields) {

				return await this.payMethodModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'name': 1 })
					.exec();

			} else {

				return await this.payMethodModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'name': 1 })
					.exec();

			}
		}
    }

    async getById(id: string): Promise<IPM>{
		
		var query
		try {
			query = await this.payMethodModel.findById(id)
		} catch (error) {
            throw new BadRequestException(`format of payment method with id ${id} not valid`)
		}

        if(!query){
            throw new NotFoundException(`payment method with id ${id} not found`)
        }

        return query
	}
	
	async updateById(id: string, form: any): Promise<IPM> {
		
		var check
		try {
			check = await this.payMethodModel.findById(id)
		} catch (error) {
            throw new BadRequestException(`format of payment method with id ${id} not valid`)
		}

        if(!check){
            throw new NotFoundException(`payment method with id ${id} not found`)
		}

		try {
			await this.payMethodModel.findOneAndUpdate({_id:id}, form)
			return  await this.payMethodModel.findById(id)
		} catch (error) {
			throw new Error(error);
		}	
	}
	
	async methodListCount(){
		const query = await this.payMethodModel.find()

		var count = new Array()
        var result = new Array()
        for(let i in query){
            count[i] = {
                order: await this.orderModel.find({ "payment.method._id": query[i]._id }).countDocuments(),
                coupon: await this.couponModel.find({ "payment_method": query[i]._id }).countDocuments()
            }

            result[i] = {
                payment_method: query[i],
                count: count[i]
            }
        }
        return result
	}
}
