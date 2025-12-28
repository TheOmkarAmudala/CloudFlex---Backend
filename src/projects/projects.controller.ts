import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Req,
    Param,
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
    assignUser(@Param('id') id: string, @Body() body) {
        return this.projectsService.assignUser(
            id,
            body.userId,
            body.role,
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


}
