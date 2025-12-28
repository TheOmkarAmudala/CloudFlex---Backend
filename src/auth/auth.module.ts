import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'SECRET_KEY_123',
            signOptions: { expiresIn: '1d' },
        }),
        UsersModule,
    ],
    providers: [AuthService, JwtStrategy], // 👈 VERY IMPORTANT
    controllers: [AuthController],
    exports: [JwtModule],
})
export class AuthModule {}
