import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';
export declare class TasksService {
    private tasksRepository;
    constructor(tasksRepository: Repository<Task>);
    create(createTaskDto: Partial<Task>, user: User): Promise<Task>;
    findAll(): Promise<Task[]>;
    findOne(id: string): Promise<Task | null>;
    update(id: string, updateTaskDto: Partial<Task>): Promise<Task | null>;
    remove(id: string): Promise<void>;
    getWorkloadStats(): Promise<unknown[]>;
}
