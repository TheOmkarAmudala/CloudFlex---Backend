import { Injectable, ForbiddenException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectUser } from './entities/project-user.entity';
import { User } from '../users/entities/user.entity';


@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepo: Repository<Project>,

        @InjectRepository(ProjectUser)
        private readonly projectUserRepo: Repository<ProjectUser>,

        @InjectRepository(User) // 👈 ADD THIS
        private readonly userRepo: Repository<User>,
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

    async updateProject(
        projectId: string,
        name: string,
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

        // Check RBAC
        const projectUser = project.projectUsers.find(
            (pu) => pu.user.id === userId,
        );

        const isOwner = projectUser?.role === 'owner';
        const isAdmin = globalRole === 'admin';

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Not allowed to update this project');
        }

        project.name = name;
        return this.projectRepo.save(project);
    }


    async assignUserToProject(
        projectId: string,
        userId: string,
        role: string,
        requesterId: string,
        globalRole: string,
    ) {
        // 1. Fetch project with users
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['projectUsers', 'projectUsers.user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // 2. RBAC check
        const projectUser = project.projectUsers.find(
            (pu) => pu.user.id === requesterId,
        );

        const isOwner = projectUser?.role === 'owner';
        const isAdmin = globalRole === 'admin';

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException(
                'Only project owner or admin can assign users',
            );
        }

        // 3. Prevent duplicate assignment
        const alreadyAssigned = project.projectUsers.some(
            (pu) => pu.user.id === userId,
        );

        if (alreadyAssigned) {
            throw new BadRequestException('User already assigned to project');
        }

        // 4. Validate user exists
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 5. Create ProjectUser
        const projectUserEntry = this.projectUserRepo.create({
            project,
            user,
                role: role as 'owner' | 'developer' | 'viewer',
        });

        return this.projectUserRepo.save(projectUserEntry);
    }

    async getProjectUsers(projectId: string) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: [
                'projectUsers',
                'projectUsers.user',
            ],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project.projectUsers.map((pu) => ({
            id: pu.user.id,
            email: pu.user.email,
            role: pu.role,
        }));
    }


    async updateUserRole(
        projectId: string,
        userId: string,
        role: 'owner' | 'developer' | 'viewer',
        currentUser: any,
    ) {
        const projectUser = await this.projectUserRepo.findOne({
            where: {
                project: { id: projectId },
                user: { id: userId },
            },
            relations: ['project', 'user'],
        });

        if (!projectUser) {
            throw new NotFoundException('User not assigned to project');
        }

        // RBAC: only owner or admin
        if (
            currentUser.role !== 'admin' &&
            projectUser.role !== 'owner'
        ) {
            throw new ForbiddenException('Not allowed');
        }

        projectUser.role = role;
        return this.projectUserRepo.save(projectUser);
    }



    async removeUserFromProject(
        projectId: string,
        userId: string,
        currentUser: any,
    ) {
        const projectUser = await this.projectUserRepo.findOne({
            where: {
                project: { id: projectId },
                user: { id: userId },
            },
            relations: ['project', 'user'],
        });

        if (!projectUser) {
            throw new NotFoundException('User not assigned to project');
        }

        // RBAC: only owner or admin
        if (
            currentUser.role !== 'admin' &&
            projectUser.role !== 'owner'
        ) {
            throw new ForbiddenException('Not allowed');
        }

        await this.projectUserRepo.remove(projectUser);

        return { message: 'User removed from project' };
    }

}
