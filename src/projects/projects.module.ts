import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectUser } from './entities/project-user.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { User } from '../users/entities/user.entity';
import { Client } from '../Client/entities/client.entity';


@Module({
    imports: [TypeOrmModule.forFeature([Project, ProjectUser, User, Client])],
    providers: [ProjectsService],
    controllers: [ProjectsController],
})
export class ProjectsModule {}
