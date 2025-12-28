import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { ProjectUser } from './project-user.entity';

@Entity()
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Client, (client) => client.projects, { nullable: false })
    client: Client;

    @OneToMany(() => ProjectUser, (pu) => pu.project)
    projectUsers: ProjectUser[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
