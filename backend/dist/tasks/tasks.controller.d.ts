import { TasksService } from './tasks.service';
import { Task } from './task.entity';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: Partial<Task>, req: any): Promise<Task>;
    findAll(): Promise<Task[]>;
    getWorkload(): Promise<unknown[]>;
    findOne(id: string): Promise<Task | null>;
    update(id: string, updateTaskDto: Partial<Task>): Promise<Task | null>;
    remove(id: string): Promise<void>;
}
