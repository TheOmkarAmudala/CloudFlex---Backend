import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { User } from './users/entities/user.entity';
import { Client } from './users/entities/client.entity';
import { Project } from './projects/entities/project.entity';
import { ProjectUser } from './projects/entities/project-user.entity';
import { ProjectsModule } from './projects/projects.module';
import { ClientsModule } from './Client/clients.module';




@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '798945',
      database: 'nest_app_db',
      autoLoadEntities: true,
      entities: [User, Client, Project, ProjectUser],
      synchronize: true,
       // dev only
    }),
    ClientsModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
  ],
})
export class AppModule {}
