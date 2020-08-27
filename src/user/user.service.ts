import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './schemas/user.schema';
import { CreateUserDTO } from './dto/user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

    async createUser(createUserDTO: CreateUserDTO): Promise<User> {
        const user = new this.userModel(createUserDTO);
        await user.save();
        return user;
    }
}
