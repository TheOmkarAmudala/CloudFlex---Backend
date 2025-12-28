import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,
  ) {}

  // 🔑 CREATE USER (FIXED)
  async create(
      email: string,
      password: string,
      clientId: string,
      globalRole: 'admin' | 'member', // ✅ REQUIRED
  ) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      email,
      password: hashed,
      clientId,
      globalRole, // ✅ now valid
    });

    return this.userRepo.save(user);
  }

  // 🔐 LOGIN VALIDATION
  async validate(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException();

    return user;
  }

  // 👥 USERS LIST
  findAll() {
    return this.userRepo.find();
  }

  async findOne(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  // 🔢 USED FOR ADMIN BOOTSTRAP
  async countUsers() {
    return this.userRepo.count();
  }

  async update(id: string, updateUserDto: any) {
    return this.userRepo.update(id, updateUserDto);
  }

  async remove(id: string) {
    return this.userRepo.delete(id);
  }

  // 👤 PROFILE + PROJECTS
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['projectUsers', 'projectUsers.project'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      globalRole: user.globalRole,
      clientId: user.clientId,
      projects: user.projectUsers.map((pu) => ({
        id: pu.project.id,
        name: pu.project.name,
        role: pu.role,
      })),
    };
  }
}
