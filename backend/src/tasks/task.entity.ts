import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    REVIEW = 'review',
    DONE = 'done',
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'simple-enum',
        enum: TaskStatus,
        default: TaskStatus.TODO,
    })
    status: TaskStatus;

    @Column({
        type: 'simple-enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
    })
    priority: TaskPriority;

    @ManyToOne(() => User, { nullable: true })
    assignedTo: User;

    @Column({ nullable: true })
    dueDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
