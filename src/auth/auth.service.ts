import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../Client/clients.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly clientsService: ClientsService,
    ) {}

    // REGISTER
    // src/auth/auth.service.ts

    async register(email: string, password: string, companyName: string) {
        // 1️⃣ Create or fetch client
        const client = await this.clientsService.findOrCreate(companyName);

        // 2️⃣ First user of a company becomes ADMIN
        const usersCount = await this.usersService.countUsersByClient(client.id);
        const globalRole = usersCount === 0 ? 'admin' : 'member';

        // 3️⃣ Create user
        const user = await this.usersService.create(
            email,
            password,
            client,
            globalRole,
        );

        return {
            id: user.id,
            email: user.email,
            company: client.name,
            globalRole: user.globalRole,
        };
    }



    // LOGIN
    async login(email: string, password: string) {
        const user = await this.usersService.validate(email, password);

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.globalRole,        // RBAC
            clientId: user.client.id,     // ✅ correct
        };

        return {
            token: this.jwtService.sign(payload),
        };
    }
}
