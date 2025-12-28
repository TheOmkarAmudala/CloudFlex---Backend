import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { Client } from '../../Client/entities/client.entity';
import { ProjectUser } from './project-user.entity';

@Entity()
@Unique(['name', 'client'])
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    // ✅ CORRECT RELATION
    @ManyToOne(() => Client, (client) => client.projects, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    client: Client;

    @OneToMany(() => ProjectUser, (pu) => pu.project)
    projectUsers: ProjectUser[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
