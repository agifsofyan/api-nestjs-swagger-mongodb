import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifiedCallback } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { IJwtPayload } from './../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: authService.returnJwtExtractor(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(jwtPayload: IJwtPayload, done: VerifiedCallback) {
        const user = await this.authService.validateUser(jwtPayload);
        if (!user) {
            return done(
                new HttpException('Unauthorized access.', HttpStatus.UNAUTHORIZED),
                false
            );
        }
        return user;
    }
}