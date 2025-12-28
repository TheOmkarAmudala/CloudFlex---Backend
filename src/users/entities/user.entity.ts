import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne
} from 'typeorm';


import { ProjectUser } from '../../projects/entities/project-user.entity';
import { Client } from '../../Client/entities/client.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    // Global role at client level (admin / member)
    @Column({ default: 'member' })
    globalRole: string;

    // REQUIRED: link user to client/company
    @ManyToOne(() => Client, (client) => client.users, {
        nullable: false,
    })
    client: Client;


    // Project-level role (optional, can be null)
    @Column({ nullable: true })
    role: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ProjectUser, (pu) => pu.user)
    projectUsers: ProjectUser[];
}
