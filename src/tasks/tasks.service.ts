import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { tasks, Task, NewTask } from '../database/schema.js';
import { eq, and, ilike, count } from 'drizzle-orm';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { GetTaskQueryDto } from './dto/get-tasks-query.dto.js';

@Injectable()
export class TasksService {
  constructor(private dbService: DatabaseService) {}

  async findAll(
    userId: number,
    getTasksQueryDto: GetTaskQueryDto,
  ): Promise<{
    data: Task[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { completed, search, page = 1, limit = 10 } = getTasksQueryDto;
    const offset = (page - 1) * limit;
    //  dynamic conditions array
    const conditions = [eq(tasks.userId, userId)];
    if (completed !== undefined) {
      conditions.push(eq(tasks.completed, completed));
    }
    if (search) {
      conditions.push(ilike(tasks.title, `%${search}%`));
    }
    const whereClause = and(...conditions);
    const data = await this.dbService.db
      .select()
      .from(tasks)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    //for meta data
    const [{ value: totalCount }] = await this.dbService.db
      .select({ value: count() })
      .from(tasks)
      .where(whereClause);
    return {
      data,
      meta: {
        total: Number(totalCount),
        page,
        limit,
        totalPages: Math.ceil(Number(totalCount) / limit),
      },
    };
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const [task] = await this.dbService.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const [newTask] = await this.dbService.db
      .insert(tasks)
      .values({ ...createTaskDto, userId } as NewTask)
      .returning();

    return newTask;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    const [updatedTask] = await this.dbService.db
      .update(tasks)
      .set(updateTaskDto)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!updatedTask)
      throw new NotFoundException(`Task with ID ${id} not found`);
    return updatedTask;
  }

  async remove(id: number, userId: number): Promise<Task> {
    const [deletedTask] = await this.dbService.db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!deletedTask)
      throw new NotFoundException(`Task with ID ${id} not found`);
    return deletedTask;
  }
}
