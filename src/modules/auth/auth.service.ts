import { Injectable, UnauthorizedException, BadRequestException, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import { Request } from 'express';
import { v4 } from 'uuid';
import * as Cryptr from 'cryptr';

import { IUser } from '../user/interfaces/user.interface';
import { IJwtPayload } from './interfaces/jwt-payload.interface';

import { JWT_ENCRYPT_SECRET_KEY, JWT_EXPIRATION_TIME, JWT_SECRET_KEY } from 'src/config/configuration';
import { IAdmin } from '../administrator/interfaces/admin.interface';

@Injectable()
export class AuthService {
    cryptr: any;

    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        @InjectModel('Admin') private readonly adminModel: Model<IAdmin>
    ) {
        this.cryptr = new Cryptr(JWT_ENCRYPT_SECRET_KEY);
    }

    async createAccessToken(userId: string, type: string) {
        
        const accessToken = sign({ userId, type }, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRATION_TIME });
        return this.encryptText(accessToken);
    }

    async validate(jwtPayload: IJwtPayload) {
        var user
        if(jwtPayload.type === 'USER'){
            user = await this.userModel.findOne({ _id: jwtPayload.userId }).populate('role', ['_id', 'adminType']);
            user.last_login = new Date()
            await user.save()
        }else{
            user = await this.adminModel.findOne({ _id: jwtPayload.userId }).populate('role', ['_id', 'adminType']);
        }

        if (!user) {
            throw new UnauthorizedException('auth.service');
        }

        var result = user.toObject()
        delete result.password
        delete result.created_at
        delete result.updated_at
        delete result.avatar

        return result;
    }

    private jwtExtractor(req: Request) {
        let token = null;

        if (req.header('x-auth-token')) {
            token = req.header('x-auth-token');
        } else if (req.headers.authorization) {
            if(req.headers.authorization.search('Bearer') === -1){
                throw new BadRequestException('Invalid Header Authorization Format.');
            }

            token = req.headers.authorization.replace('Bearer ', '').replace(' ', '');
        } else if (req.body.token) {
            token = req.body.token.replace(' ', '');
        }

        if (req.query.token) {
            token = req.body.token.replace(' ', '');
        }

        const cryptr = new Cryptr(JWT_ENCRYPT_SECRET_KEY);
        if (token) {
            try {
                token = cryptr.decrypt(token);
            } catch (err) {
                throw new BadRequestException('Invalid token authentication.');
            }
        }
        return token;
    }

    private encryptText(text: string): string {
        return this.cryptr.encrypt(text);
    }

    returnJwtExtractor() {
        return this.jwtExtractor;
    }
}
