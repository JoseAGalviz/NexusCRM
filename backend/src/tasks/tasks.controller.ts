import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Body() createTaskDto: Partial<Task>, @Request() req) {
        return this.tasksService.create(createTaskDto, req.user);
    }

    @Get()
    findAll() {
        return this.tasksService.findAll();
    }

    @Get('workload')
    getWorkload() {
        return this.tasksService.getWorkloadStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: Partial<Task>) {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }
}
