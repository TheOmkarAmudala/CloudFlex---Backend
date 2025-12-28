import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';

export enum ProjectRole {
    OWNER = 'owner',
    DEVELOPER = 'developer',
    VIEWER = 'viewer',
}

@Entity()
export class ProjectUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ProjectRole,
    })
    role: ProjectRole;

    @ManyToOne(() => User, (user) => user.projectUsers, { nullable: false })
    user: User;

    @ManyToOne(() => Project, (project) => project.projectUsers, { nullable: false })
    project: Project;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
