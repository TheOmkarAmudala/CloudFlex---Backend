import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
export { UsersService } from './users.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController], // 👈 REQUIRED
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
