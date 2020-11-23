import { 
    BadRequestException,
    Injectable, NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IPaymentMethod as IPM } from './interfaces/payment.interface';
import { Query } from 'src/utils/OptQuery';

@Injectable()
export class PaymentMethodService {
    constructor(
        @InjectModel('PaymentMethod') private readonly payMethodModel: Model<IPM>
    ) {}

    async insert(input: any){
        const checkPM = await this.payMethodModel.findOne({ name: input.name })

        if(checkPM){
            throw new BadRequestException('method name is already exists')
        }

        const query = new this.payMethodModel(input)

        await query.save()

        return query
    }

    async getAll(options: Query): Promise<IPM[]>{
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
}
