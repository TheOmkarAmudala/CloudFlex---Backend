import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientRepo: Repository<Client>,
    ) {}

    async findByName(name: string) {
        return this.clientRepo.findOne({ where: { name } });
    }

    async createClient(name: string) {
        const client = this.clientRepo.create({ name });
        return this.clientRepo.save(client);
    }

    findById(id: string) {
        return this.clientRepo.findOne({ where: { id } });
    }

    async findOrCreate(name: string): Promise<Client> {
        let client = await this.clientRepo.findOne({ where: { name } });

        if (!client) {
            client = this.clientRepo.create({ name });
            client = await this.clientRepo.save(client);
        }

        return client;
    }

}
