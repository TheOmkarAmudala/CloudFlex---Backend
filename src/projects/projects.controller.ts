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
}
