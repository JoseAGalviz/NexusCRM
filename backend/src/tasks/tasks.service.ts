import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }

    async create(createTaskDto: Partial<Task>, user: User): Promise<Task> {
        const task = this.tasksRepository.create({
            ...createTaskDto,
            // If no assignee is provided, maybe assign to creator or leave unassigned
            // For now, let's assume it can be assigned explicitly
        });
        return this.tasksRepository.save(task);
    }

    async findAll(): Promise<Task[]> {
        return this.tasksRepository.find({ relations: ['assignedTo'] });
    }

    async findOne(id: string): Promise<Task | null> {
        return this.tasksRepository.findOne({ where: { id }, relations: ['assignedTo'] });
    }

    async update(id: string, updateTaskDto: Partial<Task>): Promise<Task | null> {
        await this.tasksRepository.update(id, updateTaskDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.tasksRepository.delete(id);
    }

    // Workload View: Aggregated stats per user
    async getWorkloadStats() {
        // This query counts tasks per user and status
        // Using QueryBuilder for aggregation
        const stats = await this.tasksRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.assignedTo', 'user')
            .select('user.id', 'userId')
            .addSelect('user.firstName', 'firstName')
            .addSelect('user.lastName', 'lastName')
            .addSelect('task.status', 'status')
            .addSelect('COUNT(task.id)', 'count')
            .groupBy('user.id')
            .addGroupBy('user.firstName')
            .addGroupBy('user.lastName')
            .addGroupBy('task.status')
            .getRawMany();

        // Transform raw data into structured payload
        // { userId: { firstName, lastName, tasks: { todo: 5, done: 2 } } }
        const workload = {};
        for (const row of stats) {
            const uid = row.userId || 'unassigned';
            if (!workload[uid]) {
                workload[uid] = {
                    name: row.firstName ? `${row.firstName} ${row.lastName}` : 'Unassigned',
                    total: 0,
                    breakdown: {},
                };
            }
            workload[uid].breakdown[row.status] = parseInt(row.count, 10);
            workload[uid].total += parseInt(row.count, 10);
        }

        return Object.values(workload);
    }
}
