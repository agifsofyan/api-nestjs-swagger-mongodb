import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IUser } from './interfaces/user.interface';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

    async createUser(createUserDTO: CreateUserDTO): Promise<IUser> {
        const user = new this.userModel(createUserDTO);

        // Check if email is exist?
        const isEmailUnique = await this.userModel.findOne({ email: user.email, verified: true });
        if (isEmailUnique) {
            throw new BadRequestException('The email you\'ve entered is already exist.');
        }

        await user.save();
        
        return user;
    }
}
