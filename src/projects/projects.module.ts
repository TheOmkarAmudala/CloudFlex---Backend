import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectUser } from './entities/project-user.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Project, ProjectUser])],
    providers: [ProjectsService],
    controllers: [ProjectsController],
})
export class ProjectsModule {}
