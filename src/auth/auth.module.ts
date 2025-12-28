import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../Client/clients.module';

@Module({
    imports: [
        JwtModule.register({
            secret: 'SECRET_KEY_123',
            signOptions: { expiresIn: '1d' },
        }),
        UsersModule,
        ClientsModule, // ✅ THIS LINE FIXES THE ERROR
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {}