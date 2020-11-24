import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IProvince } from './interfaces/province.interface';
import { OptQuery } from 'src/utils/optquery';

export type IxProvince = IProvince

@Injectable()
export class ProvinceService {
    constructor(@InjectModel('Province') private provinceModel: Model<IProvince>) {}

    async list(options: OptQuery): Promise<IProvince[]> {
		const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
		const skip = offset * options.limit;
		const sortval = (options.sortval == 'asc') ? 1 : -1;

		if (options.sortby){
			if (options.fields) {

				return await this.provinceModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.exec();

			} else {

				return await this.provinceModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.exec();

			}
		}else{
			if (options.fields) {

				return await this.provinceModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'name': 1 })
					.exec();

			} else {

				return await this.provinceModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'name': 1 })
					.exec();

			}
		}
	}
    
    async findById(id: string): Promise<IProvince> {
		let result = await this.provinceModel.findById(id);

		if(!result){
			throw new NotFoundException(`Province with id ${id} does not exist`);
		}

		return result;
	}
	
	async findOne(code: string): Promise<IProvince> {
		let result = await this.provinceModel.findOne({ code: code });

		if(!result){
			throw new NotFoundException(`Province with code ${code} does not exist`);
		}

		return result;
    }
}
