import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { Client } from '../Client/entities/client.entity';

@Injectable()
export class UsersService {
  constructor(
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,
  ) {}

  // ----------------------------
  // CREATE USER
  // ----------------------------
  async create(
      email: string,
      password: string,
      client: Client,
      globalRole: 'admin' | 'member',
  ) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      email,
      password: hashed,
      client,
      globalRole,
    });

    return this.userRepo.save(user);
  }

  // ----------------------------
  // LOGIN VALIDATION
  // ----------------------------
  async validate(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['client'], // ✅ IMPORTANT
    });

    if (!user) throw new UnauthorizedException();

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException();

    return user;
  }

  // ----------------------------
  // USERS LIST
  // ----------------------------
  findAll() {
    return this.userRepo.find({ relations: ['client'] });
  }

  async findOne(id: string) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['client'],
    });
  }

  async update(id: string, updateUserDto: any) {
    if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    await this.userRepo.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.userRepo.delete(id);
  }

  async countUsersByClient(clientId: string): Promise<number> {
    return this.userRepo.count({
      where: {
        client: { id: clientId },
      },
    });
  }




  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: [
        'client',
        'projectUsers',
        'projectUsers.project',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      globalRole: user.globalRole,
      client: {
        id: user.client.id,
        name: user.client.name,
      },
      projects: user.projectUsers.map((pu) => ({
        id: pu.project.id,
        name: pu.project.name,
        role: pu.role,
      })),
    };
  }
}
