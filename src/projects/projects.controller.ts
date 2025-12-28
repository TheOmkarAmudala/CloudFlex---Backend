import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Req,
    Param,
    Put
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Delete } from '@nestjs/common';



@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get()
    getProjects(@Req() req) {
        return this.projectsService.findAll(req.user.clientId);
    }

    @Post()
    createProject(@Req() req, @Body() body) {
        return this.projectsService.create(
            body.name,
            req.user.clientId,
            req.user.sub,
        );
    }

    @Post(':id/users')
    assignUser(
        @Param('id') projectId: string,
        @Body() body,
        @Req() req,
    ) {
        return this.projectsService.assignUserToProject(
            projectId,
            body.userId,
            body.role,
            req.user.sub,
            req.user.role,
        );
    }

    @Delete(':id')
    deleteProject(@Param('id') id: string, @Req() req) {
        return this.projectsService.deleteProject(
            id,
            req.user.sub,
            req.user.role,
        );
    }

    @Get(':id')
    getProjectById(@Param('id') id: string, @Req() req) {
        return this.projectsService.findOne(id, req.user.clientId);
    }

    @Put(':id')
    updateProject(
        @Param('id') id: string,
        @Body() body,
        @Req() req,
    ) {
        return this.projectsService.updateProject(
            id,
            body.name,
            req.user.sub,
            req.user.role,
        );
    }


    @UseGuards(JwtAuthGuard)
    @Get(':id/users')
    getProjectUsers(
        @Param('id') projectId: string,
    ) {
        return this.projectsService.getProjectUsers(projectId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/users/:userId')
    updateProjectUserRole(
        @Param('id') projectId: string,
        @Param('userId') userId: string,
        @Body() body: { role: 'owner' | 'developer' | 'viewer' },
        @Req() req,
    ) {
        return this.projectsService.updateUserRole(
            projectId,
            userId,
            body.role,
            req.user,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/users/:userId')
    removeProjectUser(
        @Param('id') projectId: string,
        @Param('userId') userId: string,
        @Req() req,
    ) {
        return this.projectsService.removeUserFromProject(
            projectId,
            userId,
            req.user,
        );
    }



}
