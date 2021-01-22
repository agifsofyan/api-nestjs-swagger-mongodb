import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBankTransfer } from './interfaces/banktransfer.interface';
import { OptQuery } from 'src/utils/OptQuery';

@Injectable()
export class BanktransferService {
    constructor(
        @InjectModel('BankTransfer') private readonly transferModel: Model<IBankTransfer>
    ) {}

    async create(input: any) {
        const query = new this.transferModel(input)
        await query.save();

        //const verification = await this.mailService.templateGenerate(data)

        return query
    }

    async read(options: OptQuery) {
	const {
		offset,
		limit,
		sortby,
		sortval,
		fields,
		value,
		optFields,
		optVal
	} = options;

	const offsets = (offset == 0 ? offset : (offset - 1))
	const skip = offsets * limit
	const sortvals = (sortval == 'asc') ? 1 : -1

	var filter: object = { [fields]: value  }

	if(optFields){
		if(!fields){
			filter = { [optFields]: optVal }
		}
		filter = { [fields]: value, [optFields]: optVal }
	}

	if (sortby){
		if (fields) {
			return await this.transferModel
			.find(filter)
			.skip(Number(skip))
			.limit(Number(limit))
			.sort({ [sortby]: sortvals })
		} else {
			return await this.transferModel
			.find()
			.skip(Number(skip))
			.limit(Number(options.limit))
			.sort({ [options.sortby]: sortvals })
		}
	}else{
		if (options.fields) {
			return await this.transferModel
			.find(filter)
			.skip(Number(skip))
			.limit(Number(options.limit))
			.sort({ 'updated_at': 'desc' })
		} else {
			return await this.transferModel
			.find(filter)
			.skip(Number(skip))
			.limit(Number(options.limit))
			.sort({ 'updated_at': 'desc' })
		}
	}
    }

    async confirm(invoice_number: string) {
	var query = await this.transferModel.findOne({invoice_number: invoice_number})

	if(!query){
		throw new NotFoundException(`transfer confirmation with invoice ${invoice_number} not found`)
	}

	query.is_confirmed = true
	query.save()

	return 'order was confirmed successfully'
    }
}
