import { User } from '../users/user.entity';
export declare enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    REVIEW = "review",
    DONE = "done"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare class Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: User;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
