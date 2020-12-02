import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IHashTag } from '../hashtag/interfaces/hashtag.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { StrToUnix } from 'src/utils/StringManipulation';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class HashTagService {

	constructor(
		@InjectModel('HashTag') private readonly tagModel: Model<IHashTag>
	) {}

	async create(input: any): Promise<IHashTag> {
		const initialName = input.name
		const toName = initialName.replace(" ", "_").toLowerCase()
		
		// Check if hashtag if already exist
        const isHashtagNameExist = await this.tagModel.findOne({ name: toName });
		
		if (isHashtagNameExist) {
			throw new BadRequestException('That hashtag name is already exist.');
		}

		input.name = toName
		
		const query = new this.tagModel(input);
		return await query.save();
	}

	async findAll(options?: any): Promise<IHashTag[]> {
		const sortval = (options.sort == 'asc') ? 1 : -1;

		if (options.sort){
			if (options.name) {

				return await this.tagModel
					.find({ $where: `/^${options.name}.*/.test(this.name)` })
					.sort({ 'name': sortval })
					.exec();
			} else {

				return await this.tagModel
					.find()
					.sort({ 'name': sortval })
					.exec();
			}
		}else{
			if (options.name) {

				return await this.tagModel
					.find({ $where: `/^${options.name}.*/.test(this.name)` })
					.sort({ 'name': 'asc' })
					.exec();
			} else {

				return await this.tagModel
					.find()
					.sort({ 'name': 'asc' })
					.exec();
			}
		}
	}

	async findOne(field: any, value: any): Promise<IHashTag> {
	 	let result;
		try{
		    result = await this.tagModel.findOne({[field]: value});
		}catch(error){
		    throw new NotFoundException(`Could nod find hashtag with ${field} ${value}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find hashtag with ${field} ${value}`);
		}

		return result;
	}

	async update(id: string, input: any): Promise<IHashTag> {
		let result;
		
		// Check ID
		try{
		    result = await this.tagModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find hashtag with id ${id}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find hashtag with id ${id}`);
		}

		const initialName = input.name
		const toName = initialName.replace(" ", "_").toLowerCase()
		input.name = toName

		try {
			await this.tagModel.findByIdAndUpdate(id, input);
			return await this.tagModel.findById(id).exec();
		} catch (error) {
			throw new Error(error)
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.tagModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The hashtag could not be deleted');
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try{
			await this.tagModel.deleteMany({ _id: {$in: arrayId} });
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The hashtag could not be deleted');
		}
	}

	async search(value: any): Promise<IHashTag[]> {
		const result = await this.tagModel.find({
			"name": {$regex: ".*" + value.search + ".*", $options: "i"}
		})

		if(!result){
			throw new NotFoundException("Your search was not found")
		}

		return result
	}
}
