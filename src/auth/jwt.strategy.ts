import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'SECRET_KEY_123', // must match JwtModule
        });
    }

    async validate(payload: any) {
        // This becomes req.user
        return {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
            clientId: payload.clientId,
        };
    }
}
