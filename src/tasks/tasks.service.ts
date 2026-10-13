import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { tasks, Task, NewTask } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { urlToHttpOptions } from 'url';
import { NotFoundError } from 'rxjs';
@Injectable()
export class TasksService {
  constructor(private dbService: DatabaseService) {}

  async findAll(): Promise<Task[]> {
    return this.dbService.db.select().from(tasks);
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const [newTask] = await this.dbService.db
      .insert(tasks)
      .values(createTaskDto as NewTask)
      .returning();
    return newTask;
  }

  async findOne(id: number): Promise<Task> {
    const [task] = await this.dbService.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    if (!task) {
      throw new NotFoundException(`task not found for this id : ${id}`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const [updatedTask] = await this.dbService.db
      .update(tasks)
      .set(updateTaskDto)
      .where(eq(tasks.id, id))
      .returning();
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return updatedTask;
  }

  async remove(id: number) {
    const [deletedTask] = await this.dbService.db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    if (!deletedTask)
      throw new NotFoundException(`Task with ID ${id} not found`);
    return deletedTask;
  }
}
