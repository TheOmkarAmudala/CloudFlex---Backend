import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from './project.entity';
export type ProjectRole = 'owner' | 'developer' | 'viewer';

@Entity()
export class ProjectUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Project, (project) => project.projectUsers, {
        onDelete: 'CASCADE',
    })
    project: Project;

    @ManyToOne(() => User, (user) => user.projectUsers, {
        onDelete: 'CASCADE',
    })
    user: User;

    @Column({ type: 'varchar' })
    role: ProjectRole;
}