import { 
    Injectable, 
    BadRequestException, 
    NotFoundException,
    NotImplementedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAdmin } from './interfaces/admin.interface';
import { IRole } from '../role/interfaces/role.interface';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';

export type Admin = IAdmin

@Injectable()
export class AdministratorService {
    constructor(
        @InjectModel('Admin') private readonly adminModel: Model<IAdmin>,
        @InjectModel('Role') private readonly roleModel: Model<IRole>,
        private readonly authService: AuthService
    ) {}

    async findByEmail(email: string): Promise<IAdmin | undefined> {
        let user = await this.adminModel.findOne({ email: email }).populate('role');

        if (!user) {
            throw new BadRequestException('That email not found.');
        }

        delete user.password

        return user;
    }

    async create(createUserDTO: any): Promise<IAdmin> {
	const role = createUserDTO.role
        let user = new this.adminModel(createUserDTO);

        // Check if user email is already exist
        const isEmailExist = await this.adminModel.findOne({ email: user.email });
        if (isEmailExist) {
            throw new BadRequestException('That email is already exist.');
        }

	const isRole = await this.roleModel.find({ _id: { $in: role } })

	if(role.length !== isRole.length){
		throw new NotFoundException('role id not found')
	}

        await user.save();

        user = user.toObject();
        delete user.password;

        return user;
    }

    async update(id: string, updateUserDto: any): Promise<IAdmin> {
		let data;
		
		// Check ID
		try{
		    data = await this.adminModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find topic with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find topic with id ${id}`);
        }
        
        try {
            await this.adminModel.findByIdAndUpdate(id, updateUserDto);
            return await this.adminModel.findById(id).exec();
        } catch (error) {
            throw new Error(error)
        }
	}

    async findAll(options: any): Promise<IAdmin[]> {
        const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
        const skip = offset * options.limit;
        const sortval = (options.sortval == 'asc') ? 1 : -1;

        if (options.sortby) {
            if (options.fields) {

                return await this.adminModel
                    .find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ [options.sortby]: sortval })
                    .populate('role')

            } else {

                return await this.adminModel
                    .find()
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ [options.sortby]: sortval })
                    .populate('role')

            }
        } else {
            if (options.fields) {

                return await this.adminModel
                    .find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ 'created_at': 'desc' })
                    .populate('role')

            } else {

                return await this.adminModel
                    .find()
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ 'created_at': 'desc' })
                    .populate('role')
            }
        }
    }

    async findById(id: string): Promise<IAdmin> {
        let data;
       try{
           data = await this.adminModel.findById(id).populate('role')
       }catch(error){
           throw new NotFoundException(`Could not find user/administrator with id ${id}`);
       }

       if(!data){
           throw new NotFoundException(`Could not find user/administrator with id ${id}`);
       }

       return data;
   }

    async delete(id: string): Promise<string> {
        try{
            await this.adminModel.findByIdAndRemove(id).exec();
            return 'ok';
        }catch(err){
            throw new NotImplementedException('The user/administrator could not be deleted');
        }
    }

    async deleteMany(arrayId: any): Promise<string> {
        try {
            await this.adminModel.deleteMany({ _id: { $in: arrayId } });
            return 'ok';
        } catch (err) {
            throw new NotImplementedException('The user/administrator could not be deleted');
        }
    }

    async findOne(options: object): Promise<IAdmin> {
    	const data = await this.adminModel.findOne(options).populate('role')

    	if(!data){
    		throw new NotFoundException(`Could nod find user/administrator with your condition.`)
    	}

    	return data
    }

    async find(options: object): Promise<IAdmin[]> {
        const data = await this.adminModel.find(options, {"_id": 1, "name": 1, "email": 1})

    	if(!data){
    		throw new NotFoundException(`Could not find user/administrator`)
    	}

    	return data
    }

    async search(value: any): Promise<IAdmin[]> {
        const result = await this.adminModel.find({
            $or: [
                { name: {$regex: ".*" + value.search + ".*", $options: "i"} },
                { email: {$regex: ".*" + value.search + ".*", $options: "i"} }
            ]
        })

        if (!result) {
            throw new NotFoundException("Your search was not found")
        }

        return result
    }

    async searchAgent(id: string, value: any): Promise<IAdmin[]> {
        const result = await this.adminModel.find({
            role: {$in: [id]},
            $or: [
                { name: {$regex: ".*" + value.search + ".*", $options: "i"} },
                { email: {$regex: ".*" + value.search + ".*", $options: "i"} }
            ]
        },{"_id": 1, "name": 1, "email": 1})

        if (!result) {
            throw new NotFoundException("Your search was not found")
        }

        return result
    }

    async login(req: Request, login: any) {
        const { email } = login;

        let result = await this.adminModel.findOne({ email });
        if (!result) {
            throw new NotFoundException('The email you\'ve entered does not exist.');
        }

        // Verify password
        const match = await bcrypt.compare(login.password, result.password);
        if (!match) {
            throw new BadRequestException('The password you\'ve entered is incorrect.');
        }

        result = result.toObject();
        delete result.role
        delete result.password

        return {
            administrator: result,
            accessToken: await this.authService.createAccessToken(result._id, "ADMIN")
        }
    }
}