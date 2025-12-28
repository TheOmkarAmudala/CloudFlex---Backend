import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectUser } from './entities/project-user.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectRepo: Repository<Project>,
        @InjectRepository(ProjectUser)
        private projectUserRepo: Repository<ProjectUser>,
    ) {}

    async findAll(clientId: string) {
        return this.projectRepo.find({
            where: { clientId },
            relations: ['projectUsers', 'projectUsers.user'],
        });
    }

    async create(name: string, clientId: string, userId: string) {
        // 1️⃣ Check for existing project
        const existingProject = await this.projectRepo.findOne({
            where: { name, clientId },
        });

        if (existingProject) {
            throw new ConflictException(
                'Project already exists. Please try with another name.'
            );
        }

        // 2️⃣ Create project
        const project = await this.projectRepo.save({
            name,
            clientId,
        });

        // 3️⃣ Creator becomes OWNER
        await this.projectUserRepo.save({
            project,
            user: { id: userId } as any,
            role: 'owner',
        });

        return project;
    }

    async assignUser(
        projectId: string,
        userId: string,
        role: 'owner' | 'developer' | 'viewer',
    ) {
        return this.projectUserRepo.save({
            project: { id: projectId } as any,
            user: { id: userId } as any,
            role,
        });
    }
}
