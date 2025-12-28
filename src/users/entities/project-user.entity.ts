import {Entity, ManyToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import {Project} from "../../projects/entities/project.entity";
import { User } from './user.entity';

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

    @Column()
    role: 'owner' | 'developer' | 'viewer';
}
