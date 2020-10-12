import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { ISDistrict } from './interfaces/subdistrict.interface';
import { OptQuery } from '../utils/optquery';

import { IxProvince } from '../provinces/province.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class SubdistrictService {
    constructor(
		@InjectModel('Subdistrict') private subdistrictModel: Model<ISDistrict>,
		@InjectModel('Province') private readonly provinceModel: Model<IxProvince>
	) {}

    async list(code: string): Promise<ISDistrict[]> {
		const result = await this.subdistrictModel.aggregate([
			{ $match: { "province_code": code } },
			{$lookup: {
				from: "provinces", // collection name in db
				localField: "province_code",
				foreignField: "code",
				as: "province_detail"
			}},
			{ $sort : { city : 1, urban: 1 } }
		])

		if(! result) {
			throw new NotFoundException(`Subdistrict with code ${code} does not exist`);
		}

		return result
	}
    
    async findById(id: string): Promise<ISDistrict[]> {

		const checkId = await this.subdistrictModel.findById(ObjectId(id))

		if(!checkId){
			throw new NotFoundException(`Subdistrict with id ${id} does not exist`);
		}

		const result = await this.subdistrictModel.aggregate([
			{ $match: { "_id": ObjectId(id) } },
			{$lookup: {
				from: "provinces",
				localField: "province_code",
				foreignField: "code",
				as: "province_detail"
			}}
		])

		return result[0];
	}
	
	async findOne(code: string): Promise<ISDistrict> {
		const checkCode = await this.subdistrictModel.findOne({province_code: code})

		if(!checkCode){
			throw new NotFoundException(`Subdistrict with province_code ${code} does not exist`);
		}

		const result = await this.subdistrictModel.aggregate([
			{ $match: { "province_code": code } },
			{$lookup: {
				from: "provinces",
				localField: "province_code",
				foreignField: "code",
				as: "province_detail"
			}}
		])

		return result[0];
    }
}
