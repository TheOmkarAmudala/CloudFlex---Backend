import { Controller, Post, Body } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Post()
    create(@Body('name') name: string) {
        return this.clientsService.createClient(name);
    }
}
