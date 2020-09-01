import { 
    Injectable, 
    BadRequestException,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FastifyRequest } from 'fastify';
import * as bcrypt from 'bcrypt';
import * as normalize from 'normalize-url';
import * as gravatar from 'gravatar';

import { AuthService } from '../auth/auth.service';
import { IUser } from './interfaces/user.interface';
import { UserRegisterDTO } from './dto/register.dto';
import { UserLoginDTO } from './dto/login.dto';
import { RefreshAccessTokenDTO } from './dto/refresh-access-token.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private readonly authService: AuthService
    ) {}

    async userRegister(userRegisterDTO: UserRegisterDTO): Promise<IUser> {
        const user = new this.userModel(userRegisterDTO);

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

        return user;
    }

    async userLogin(req: FastifyRequest, userLoginDTO: UserLoginDTO) {
        const user = await this.userModel.findOne({ email: userLoginDTO.email });
        if (!user) {
            throw new NotFoundException('The email you\'ve entered does not exist.');
        }

        // Verify password
        const match = await bcrypt.compare(userLoginDTO.password, user.password);
        if (!match) {
            throw new NotFoundException('The password you\'ve entered is incorrect.');
        }

        return {
            user: user.depopulate('password'),
            accessToken: await this.authService.createAccessToken(user._id),
            refreshToken: await this.authService.createRefreshToken(req, user._id)
        }
    }

    async refreshAccessToken(refreshAccessToken: RefreshAccessTokenDTO) {
        const userId = await this.authService.findRefreshToken(refreshAccessToken.refreshToken);

        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new BadRequestException('User not found.');
        }
        
        return {
            accessToken: await this.authService.createAccessToken(user._id)
        }
    }
}
