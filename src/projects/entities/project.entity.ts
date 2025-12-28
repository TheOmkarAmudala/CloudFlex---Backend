import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { ProjectUser } from './project-user.entity';

@Entity()
@Unique(['name', 'clientId'])
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    // project belongs to a client
    @Column()
    clientId: string;

    @OneToMany(() => ProjectUser, (pu) => pu.project)
    projectUsers: ProjectUser[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
