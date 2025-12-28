import { Controller, Post, Body, UseGuards, Get, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Post('register')
    async register(@Body() body) {
        const { email, password, companyName } = body;

        if (!companyName) {
            throw new BadRequestException('Company name is required');
        }

        return this.authService.register(email, password, companyName);
    }


    @Post('login')
    async login(@Body() body) {
        return this.authService.login(body.email, body.password);
    }

    // ✅ THIS IS THE CORRECT /me ROUTE
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req) {
        return this.usersService.getProfile(req.user.sub);
    }
}
