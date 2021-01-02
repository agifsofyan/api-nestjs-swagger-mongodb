import { 
	Injectable, 
	NotFoundException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IReseller } from './interfaces/reseller.interface';
import { OptQuery } from 'src/utils/OptQuery';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ResellerService {

	constructor(@InjectModel('Reseller') private readonly resellerModel: Model<IReseller>) {}

	async create(createResellerDto: any): Promise<IReseller> {
		const createReseller = new this.resellerModel(createResellerDto);
		return await createReseller.save();
	}

	async findAll(options: OptQuery): Promise<IReseller[]> {
		const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
		const skip = offset * options.limit;
		const sortval = (options.sortval == 'asc') ? 1 : -1;

		if (options.sortby){
			if (options.fields) {

				return await this.resellerModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.exec();

			} else {

				return await this.resellerModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.exec();

			}
		}else{
			if (options.fields) {

				return await this.resellerModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })
					.exec();

			} else {

				return await this.resellerModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })
					.exec();

			}
		}
	}

	async findById(id: string): Promise<IReseller> {
	 	let result;
		try{
		    result = await this.resellerModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find reseller with id ${id}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find reseller with id ${id}`);
		}

		return result;
	}

	async update(id: string, updateResellerDto: any): Promise<IReseller> {
		let result;
		
		// Check ID
		try{
		    result = await this.resellerModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find reseller with id ${id}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find reseller with id ${id}`);
		}

		try {
			await this.resellerModel.findByIdAndUpdate(id, updateResellerDto);
			return await this.resellerModel.findById(id);
		} catch (error) {
			throw new Error(error)
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.resellerModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The reseller could not be deleted');
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try {
			await this.resellerModel.deleteMany({ _id: { $in: arrayId } });
			return 'ok';
		} catch (err) {
			throw new NotImplementedException('The reseller could not be deleted');
		}
	}

	async search(value: any): Promise<IReseller[]> {
		const result = await this.resellerModel.find({
			"content": {$regex: ".*" + value.search + ".*", $options: "i"}
		})

		if (!result) {
			throw new NotFoundException("Your search was not found")
		}

		return result
	}

	async insertMany(value: any) {
		const arrayId = value.id

		var found = await this.resellerModel.find({ _id: { $in: arrayId } })
		
		for(let i in found){
		     found[i]._id = new ObjectId()
		}

		try {
			return await this.resellerModel.insertMany(found);
		} catch (e) {
			throw new NotImplementedException(`The reseller could not be cloned`);
		}
	}
}
