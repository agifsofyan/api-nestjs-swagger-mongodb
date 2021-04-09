import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAdmin } from '../administrator/interfaces/admin.interface';
import { IFollowUp } from './interfaces/followup.interface';
import { OptQuery } from 'src/utils/OptQuery';

@Injectable()
export class FollowupService {
    constructor(
	@InjectModel('FollowUp') private readonly followModel: Model<IFollowUp>,
	@InjectModel('Admin') private readonly adminModel: Model<IAdmin>
    ) {}

	// async create(userId: string, createFollowDto: any): Promise<IFollowUp> {
	// 	const query = new this.followModel(createFollowDto);

	// 	// Check if topic name is already exist
    //     	const isNameExist = await this.followModel.findOne({ name: query.name });
        	
	// 	if (isNameExist) {
    //     	throw new BadRequestException('That name is already exist.');
	// 	}

	// 	const admin = await this.adminModel.findById(userId)

	// 	if(!admin){
	// 	    throw new NotFoundException('User not found')
	// 	}

	// 	query.by = userId

	// 	return await query.save();
	// }

	// async findAll(options: OptQuery): Promise<IFollowUp[]> {
	// 	const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
	// 	const skip = offset * options.limit;
	// 	const sortval = (options.sortval == 'asc') ? 1 : -1;

	// 	if (options.sortby){
	// 		if (options.fields) {

	// 			return await this.followModel
	// 				.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
	// 				.skip(Number(skip))
	// 				.limit(Number(options.limit))
	// 				.sort({ [options.sortby]: sortval })

	// 		} else {

	// 			return await this.followModel
	// 				.find()
	// 				.skip(Number(skip))
	// 				.limit(Number(options.limit))
	// 				.sort({ [options.sortby]: sortval })

	// 		}
	// 	}else{
	// 		if (options.fields) {

	// 			return await this.followModel
	// 				.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
	// 				.skip(Number(skip))
	// 				.limit(Number(options.limit))
	// 				.sort({ 'updated_at': 'desc' })

	// 		} else {

	// 			return await this.followModel
	// 				.find()
	// 				.skip(Number(skip))
	// 				.limit(Number(options.limit))
	// 				.sort({ 'updated_at': 'desc' })

	// 		}
	// 	}
	// }

	async findById(id: string): Promise<IFollowUp> {
	 	let result;
		try{
		    result = await this.followModel.findOne({_id:id})
		}catch(error){
		    throw new NotFoundException(`Could nod find follow-up with id ${id}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find follow-up with id ${id}`);
		}

		return result;
	}

	async update(userId: string, id: string, input: any): Promise<IFollowUp> {
		let result;
		
		// Check ID
		try{
		    result = await this.followModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could not find follow-up with id ${id}`);
		}

		if(!result){
			throw new NotFoundException(`Could not find follow-up with id ${id}`);
		}

		input.by = userId

		try {
			await this.followModel.findByIdAndUpdate(id, input);
			return await this.followModel.findById(id);
		} catch (error) {
			throw new Error(error)
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.followModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The follow-up could not be deleted');
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try{
			await this.followModel.deleteMany({ _id: {$in: arrayId} });
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The follow-up could not be deleted');
		}
	}

	async search(value: any): Promise<IFollowUp[]> {
		const result = await this.followModel.find({ $text: { $search: value.search } }).populate('by', ['_id', 'name', 'email', 'phone_number'])

		if(!result){
			throw new NotFoundException("Your search was not found")
		}

		return result
	}
}
