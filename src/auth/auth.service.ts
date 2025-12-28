import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    async register(email: string, password: string, clientId: string) {
        // 🔑 Decide global role (first user = admin)
        const usersCount = await this.usersService.countUsers();

        const globalRole = usersCount === 0 ? 'admin' : 'member';

        const user = await this.usersService.create(
            email,
            password,
            clientId,
            globalRole,
        );

        return {
            id: user.id,
            email: user.email,
            clientId: user.clientId,
            globalRole: user.globalRole,
        };
    }

    async login(email: string, password: string) {
        const user = await this.usersService.validate(email, password);

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.globalRole,   // 🔐 used in RBAC
            clientId: user.clientId,
        };

        return {
            token: this.jwtService.sign(payload),
        };
    }
}
