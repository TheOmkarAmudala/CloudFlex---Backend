import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from './project.entity';

@Entity()
export class ProjectUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.projectUsers, { nullable: false })
    user: User;

    @ManyToOne(() => Project, (project) => project.projectUsers, { nullable: false })
    project: Project;

    @Column()
    role: 'owner' | 'developer' | 'viewer';
}
