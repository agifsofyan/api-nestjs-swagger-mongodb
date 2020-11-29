import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
    HttpStatus
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as normalize from 'normalize-url';
import * as gravatar from 'gravatar';
import { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { IUser } from './interfaces/user.interface';
import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserChangePasswordDTO } from './dto/user-change-password.dto';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private readonly authService: AuthService,
        private readonly profileService: ProfileService,
    ) {}

    async create(req: Request, userRegisterDTO: UserRegisterDTO) {
        let user = new this.userModel(userRegisterDTO);

        // Check if user email is already exist
        const isEmailExist = await this.userModel.findOne({ email: user.email });
        if (isEmailExist) {
            throw new BadRequestException('The email you\'ve entered is already exist.');
        }

        const avatar = normalize(
            gravatar.url(user.email, {
              s: '200',
              r: 'pg',
              d: 'mm'
            }),
            { forceHttps: true }
        );
        
        user.avatar = avatar;
        await user.save();

        user = user.toObject();
        delete user.role
        delete user.password
        delete user.created_at
        delete user.updated_at

        // return user;
        return {
            user: user,
            accessToken: await this.authService.createAccessToken(user._id, "USER")
        }
    }

    async login(req: Request, userLoginDTO: UserLoginDTO) {
        const { email } = userLoginDTO;

        let user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('The email you\'ve entered does not exist.');
        }

        // Verify password
        const match = await bcrypt.compare(userLoginDTO.password, user.password);
        if (!match) {
            throw new BadRequestException('The password you\'ve entered is incorrect.');
        }

        user = user.toObject()
        delete user.role
        delete user.password
        delete user.created_at
        delete user.updated_at

        return {
            user,
            accessToken: await this.authService.createAccessToken(user._id, "USER")
        }
    }

    async changePassword(userId: IUser, changePasswordDTO: UserChangePasswordDTO) {
        const { old_password, password } = changePasswordDTO;

        const user = await this.userModel.findOne({ _id: userId });

        const verify_password = await bcrypt.compare(old_password, user.password);
        if (!verify_password) {
            throw new BadRequestException('Incorrect old password.');
        }

        const salt = await bcrypt.genSalt(12);
        const new_password = await bcrypt.hash(password, salt);

        try {
            await this.userModel.updateOne({ _id: userId }, { password: new_password });
            return { status: HttpStatus.OK, message: 'Your password has been changed.' }
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async whoAmI(user) {
        user = await this.userModel.findOne(user);
	
	delete user.role
        delete user.password
        delete user.created_at
        delete user.updated_at
        delete user.__v
            
        var profile = await this.profileService.getProfile(user)

        //console.log('profile', profile)

        if(!profile){ 
            return { user:user }
        }

        return profile
    }
}
