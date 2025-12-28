import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';

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

    async findOne(projectId: string, clientId: string) {
        const project = await this.projectRepo.findOne({
            where: {
                id: projectId,
                clientId,
            },
            relations: ['projectUsers', 'projectUsers.user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
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

    async deleteProject(
        projectId: string,
        userId: string,
        globalRole: string,
    ) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['projectUsers', 'projectUsers.user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check if user is OWNER of this project
        const projectUser = project.projectUsers.find(
            (pu) => pu.user.id === userId,
        );

        const isOwner = projectUser?.role === 'owner';
        const isAdmin = globalRole === 'admin';

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Not allowed to delete this project');
        }

        // Delete project users first (FK safety)
        await this.projectUserRepo.delete({
            project: { id: projectId } as any,
        });

        // Delete project
        await this.projectRepo.delete(projectId);

        return { message: 'Project deleted successfully' };
    }
}
