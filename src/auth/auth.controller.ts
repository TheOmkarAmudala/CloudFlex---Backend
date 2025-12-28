import { Controller, Post, Body,  Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}


    @Post('register')
    async register(@Body() body) {
        return this.authService.register(
            body.email,
            body.password,
            body.clientId,
        );

    }

    @Post('login')
    async login(@Body() body) {
        return this.authService.login(body.email, body.password);
    }

}

@Controller('users')
export class UsersController {

    @Get('me')
    getMe(@Req() req) {
        // TEMP: return dummy user (replace later with JWT logic)
        return {
            id: 'demo-id',
            email: 'test@test.com',
            role: 'member',
        };
    }
}
