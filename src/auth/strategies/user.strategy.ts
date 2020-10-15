import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Req } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { JWT_SECRET_KEY } from '../../config/configuration';

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, 'jwt') {

    constructor(
        private readonly authService: AuthService
    ) {
        super({
            jwtFromRequest: authService.returnJwtExtractor(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET_KEY,
        })
    }

    async validate(@Req() req): Promise<IJwtPayload> {
        return req;
    }

}
