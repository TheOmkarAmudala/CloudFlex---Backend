import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,
  ) {}

  async create(email: string, password: string, clientId: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      email,
      password: hashed,
      clientId,
      globalRole: 'member',

    });

    return this.userRepo.save(user);
  }

  async validate(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException();

    return user;
  }


findAll() {
    return this.userRepo.find();
  }

  async findOne(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }



  async update(id: number, updateUserDto: any) {
    return this.userRepo.update(id, updateUserDto);
  }

  async remove(id: number) {
    return this.userRepo.delete(id);
  }

}
