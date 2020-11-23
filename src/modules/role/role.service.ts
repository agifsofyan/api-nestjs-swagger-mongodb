import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IRole } from './interface/role.interface';
import { OptQuery } from 'src/utils/OptQuery';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class RoleService {

	constructor(@InjectModel('Role') private readonly roleModel: Model<IRole>) {}

	async create(createRoleDto: any): Promise<IRole> {
		const createRole = new this.roleModel(createRoleDto);

		const { adminType } = createRoleDto

		const type = adminType.toUpperCase()

		const AdminTypeExist = await this.roleModel.findOne({ adminType: type })
        	
		if (AdminTypeExist) {
        	throw new BadRequestException('That Admin Type is already exist.')
		}

		createRole.adminType = type

		return await createRole.save();
	}

	async findAll(options: OptQuery): Promise<IRole[]> {
		const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
		const skip = offset * options.limit;
		const sortval = (options.sortval == 'asc') ? 1 : -1;

		if (options.sortby){
			if (options.fields) {

				return await this.roleModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.exec();

			} else {

				return await this.roleModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.exec();

			}
		}else{
			if (options.fields) {

				return await this.roleModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'created_at': 'desc' })
					.exec();

			} else {

				return await this.roleModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'created_at': 'desc' })
					.exec();

			}
		}
	}

	async findById(id: string): Promise<IRole> {
	 	let data;
		try{
		    data = await this.roleModel.findById(id)
		}catch(error){
		    throw new NotFoundException(`Could nod find role with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find role with id ${id}`);
		}

		return data;
	}

	async update(id: string, updateRoleDto: any): Promise<IRole> {
		let data;
		
		// Check ID
		try{
		    data = await this.roleModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find role with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find role with id ${id}`);
		}
		const { adminType } = updateRoleDto

		if(adminType){
			updateRoleDto.adminType = adminType.toUpperCase()
		}

		try {
			await this.roleModel.findByIdAndUpdate(id, updateRoleDto);
			return await this.roleModel.findById(id).exec();
		} catch (error) {
			throw new Error(error)
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.roleModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The role could not be deleted');
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try {
			await this.roleModel.deleteMany({ _id: { $in: arrayId } });
			return 'ok';
		} catch (err) {
			throw new NotImplementedException('The role could not be deleted');
		}
	}

	async search(value: any): Promise<IRole[]> {
		const result = await this.roleModel.find({
			"adminType": {$regex: ".*" + value.search + ".*", $options: "i"}
		})

		if (!result) {
			throw new NotFoundException("Your search was not found")
		}

		return result
	}

	async insertMany(value: any): Promise<IRole[]> {
		const arrayId = value.id

		var found = await this.roleModel.find({ _id: { $in: arrayId } })
		
		for(let i in found){
			found[i]._id = new ObjectId()
		}

		try {
			return await this.roleModel.insertMany(found);
		} catch (e) {
			throw new NotImplementedException(`The role could not be cloned`);
		}
	}
}
