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
        }else{
            user = await this.adminModel.findOne({ _id: jwtPayload.userId }).populate('role', ['_id', 'adminType']);
        }

        if (!user) {
            throw new UnauthorizedException('auth.service');
        }

        user = user.toObject()
        delete user.password
        delete user.created_at
        delete user.updated_at
        delete user.avatar

        return user;
    }

    private jwtExtractor(req: Request) {
        let token = null;

        if (req.header('x-auth-token')) {
            token = req.header('x-auth-token');
        } else if (req.headers.authorization) {
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

    async testExtractor(@Req() req) {
    	let token = null;

        if (req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
        } else if (req.headers.authorization) {
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
}
