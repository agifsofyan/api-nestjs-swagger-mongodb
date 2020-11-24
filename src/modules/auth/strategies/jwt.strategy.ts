import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { JWT_SECRET_KEY } from 'src/config/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: authService.returnJwtExtractor(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET_KEY
        });
    }

    async validate(payload: IJwtPayload) {
        // console.log('payload strategy', payload)
        const user = await this.authService.validate(payload);
        if (!user) {
            throw new UnauthorizedException('jwt.strategy');
        }
        return user;
    }
}
