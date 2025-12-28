import {
    Injectable,
    ForbiddenException,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from './entities/project.entity';
import { ProjectUser } from './entities/project-user.entity';
import { User } from '../users/entities/user.entity';
import { Client } from '../Client/entities/client.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepo: Repository<Project>,

        @InjectRepository(ProjectUser)
        private readonly projectUserRepo: Repository<ProjectUser>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Client)
        private readonly clientRepo: Repository<Client>,
    ) {}

    // ----------------------------
    // GET ALL PROJECTS
    // ----------------------------
    async findAll(clientId: string) {
        return this.projectRepo.find({
            where: { client: { id: clientId } },
            relations: ['projectUsers', 'projectUsers.user'],
        });
    }

    // ----------------------------
    // GET SINGLE PROJECT
    // ----------------------------
    async findOne(projectId: string, clientId: string) {
        const project = await this.projectRepo.findOne({
            where: {
                id: projectId,
                client: { id: clientId },
            },
            relations: ['projectUsers', 'projectUsers.user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    // ----------------------------
    // CREATE PROJECT
    // ----------------------------
    async create(name: string, clientId: string, userId: string) {
        const client = await this.clientRepo.findOne({
            where: { id: clientId },
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        const existing = await this.projectRepo.findOne({
            where: { name, client: { id: clientId } },
        });

        if (existing) {
            throw new ConflictException('Project already exists');
        }

        const project = this.projectRepo.create({
            name,
            client,
        });

        const savedProject = await this.projectRepo.save(project);

        // creator becomes OWNER
        await this.projectUserRepo.save({
            project: savedProject,
            user: { id: userId } as User,
            role: 'owner',
        });

        return savedProject;
    }

    // ----------------------------
    // UPDATE PROJECT
    // ----------------------------
    async updateProject(
        projectId: string,
        name: string,
        requesterId: string,
        globalRole: string,
    ) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['projectUsers', 'projectUsers.user'],
        });

        if (!project) throw new NotFoundException('Project not found');

        const requester = project.projectUsers.find(
            (pu) => pu.user.id === requesterId,
        );

        const isOwner = requester?.role === 'owner';
        const isAdmin = globalRole === 'admin';

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Not allowed');
        }

        project.name = name;
        return this.projectRepo.save(project);
    }

    // ----------------------------
    // DELETE PROJECT
    // ----------------------------
    async deleteProject(
        projectId: string,
        requesterId: string,
        globalRole: string,
    ) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['projectUsers', 'projectUsers.user'],
        });

        if (!project) throw new NotFoundException('Project not found');

        const requester = project.projectUsers.find(
            (pu) => pu.user.id === requesterId,
        );

        const isOwner = requester?.role === 'owner';
        const isAdmin = globalRole === 'admin';

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Not allowed');
        }

        await this.projectUserRepo.delete({
            project: { id: projectId },
        });

        await this.projectRepo.delete(projectId);

        return { message: 'Project deleted successfully' };
    }

    // ----------------------------
    // ASSIGN USER TO PROJECT
    // ----------------------------
    async assignUserToProject(
        projectId: string,
        userId: string,
        role: 'owner' | 'developer' | 'viewer',
        requesterId: string,
        globalRole: string,
    ) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['projectUsers', 'projectUsers.user'],
        });

        if (!project) throw new NotFoundException('Project not found');

        const requester = project.projectUsers.find(
            (pu) => pu.user.id === requesterId,
        );

        const isOwner = requester?.role === 'owner';
        const isAdmin = globalRole === 'admin';

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Only owner or admin allowed');
        }

        const alreadyAssigned = project.projectUsers.some(
            (pu) => pu.user.id === userId,
        );

        if (alreadyAssigned) {
            throw new BadRequestException('User already assigned');
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const projectUser = this.projectUserRepo.create({
            project,
            user,
            role,
        });

        return this.projectUserRepo.save(projectUser);
    }

    // ----------------------------
    // LIST PROJECT USERS
    // ----------------------------
    async getProjectUsers(projectId: string) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['projectUsers', 'projectUsers.user'],
        });

        if (!project) throw new NotFoundException('Project not found');

        return project.projectUsers.map((pu) => ({
            id: pu.user.id,
            email: pu.user.email,
            role: pu.role,
        }));
    }

    // ----------------------------
    // UPDATE USER ROLE
    // ----------------------------
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
            throw new NotFoundException('User not assigned');
        }

        if (currentUser.role !== 'admin') {
            throw new ForbiddenException('Only admin can update roles');
        }

        projectUser.role = role;
        return this.projectUserRepo.save(projectUser);
    }

    // ----------------------------
    // REMOVE USER FROM PROJECT
    // ----------------------------
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
            throw new NotFoundException('User not assigned');
        }

        if (currentUser.role !== 'admin') {
            throw new ForbiddenException('Only admin can remove users');
        }

        await this.projectUserRepo.remove(projectUser);
        return { message: 'User removed from project' };
    }
}
