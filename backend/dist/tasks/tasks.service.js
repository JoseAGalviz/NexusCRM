"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./task.entity");
let TasksService = class TasksService {
    tasksRepository;
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
    }
    async create(createTaskDto, user) {
        const task = this.tasksRepository.create({
            ...createTaskDto,
        });
        return this.tasksRepository.save(task);
    }
    async findAll() {
        return this.tasksRepository.find({ relations: ['assignedTo'] });
    }
    async findOne(id) {
        return this.tasksRepository.findOne({ where: { id }, relations: ['assignedTo'] });
    }
    async update(id, updateTaskDto) {
        await this.tasksRepository.update(id, updateTaskDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.tasksRepository.delete(id);
    }
    async getWorkloadStats() {
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
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map