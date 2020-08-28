import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sign } from 'jsonwebtoken';

import { v4 } from 'uuid';
import { FastifyRequest } from 'fastify';
import * as Cryptr from 'cryptr';

import { IUser } from 'src/user/interfaces/user.interface';
import { IRefreshToken } from './interfaces/refresh-token.interface';
import { IJwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    cryptr: any;

    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        @InjectModel('RefreshToken') private readonly refreshTokenModel: Model<IRefreshToken>
    ) {
        this.cryptr = new Cryptr(process.env.ENCRYPT_JWT_SECRET);
    }

    async createAccessToken(userId: string) {
        const accessToken = sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
        return this.encryptText(accessToken);
    }

    async createRefreshToken(req: FastifyRequest, userId: string) {
        const refreshToken = new this.refreshTokenModel({
            userId,
            refreshToken: v4(),
            ip: req.ip,
            browser: req.headers['user-agent'] || 'None'
        });
        await refreshToken.save();
        return refreshToken.refreshToken;
    }

    async findRefreshToken(token: string) {
        const refreshToken = await this.refreshTokenModel.findOne({ refreshToken: token });
        if (!refreshToken) {
            throw new UnauthorizedException('Session has expired.');
        }
        return refreshToken.userId;
    }

    async validateUser(jwtPayload: IJwtPayload): Promise<any> {
        const user = await this.userModel.findOne({ _id: jwtPayload.userId });
        if (!user) {
            throw new UnauthorizedException('User not found.');
        }
        return user;
    }

    private jwtExtractor(req: FastifyRequest) {
        let token = null;

        if (req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
        } else if (req.headers.authorization) {
            token = req.headers.authorization.replace('Bearer ', '').replace(' ', '');
        } else if (req.body['token']) {
            token = req.body['token'].replace(' ', '');
        }
        if (req.query['token']) {
            token = req.body['token'].replace(' ', '');
        }

        const cryptr = new Cryptr(process.env.ENCRYPT_JWT_SECRET);
        if (token) {
            try {
                token = cryptr.decrypt(token);
            } catch (err) {
                throw new BadRequestException('An unexpected error has occurred.');
            }
        }
        return token;
    }

    returnJwtExtractor() {
        return this.jwtExtractor;
    }

    encryptText(text: string): string {
        return this.cryptr.encrypt(text);
    }
}