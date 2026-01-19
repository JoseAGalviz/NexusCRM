import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('contacts')
export class Contact {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    company: string;

    @Column({ default: 'lead' }) // lead, customer, lost
    status: string;

    @ManyToOne(() => User, { nullable: true })
    assignedTo: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
