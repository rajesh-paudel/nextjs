import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { tasks, Task, NewTask } from '../database/schema.js';
import { eq, and, ilike, count, lte, gte, desc, asc, sql } from 'drizzle-orm';
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
    const {
      status,
      priority,
      search,
      page = 1,
      limit = 10,
      dueDateFrom,
      dueDateTo,
      createdFrom,
      createdTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = getTasksQueryDto;
    const offset = (page - 1) * limit;
    //  dynamic conditions array
    const conditions = [eq(tasks.userId, userId)];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }
    if (priority) {
      conditions.push(eq(tasks.priority, priority));
    }
    if (search) {
      conditions.push(ilike(tasks.title, `%${search}%`));
    }
    if (dueDateFrom) {
      conditions.push(gte(tasks.dueDate, new Date(dueDateFrom)));
    }

    if (dueDateTo) {
      conditions.push(lte(tasks.dueDate, new Date(dueDateTo)));
    }

    if (createdFrom) {
      conditions.push(gte(tasks.createdAt, new Date(createdFrom)));
    }

    if (createdTo) {
      conditions.push(lte(tasks.createdAt, new Date(createdTo)));
    }
    const whereClause = and(...conditions);

    const sortColumnMap = {
      title: tasks.title,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
    };

    const selectedColumn = sortColumnMap[sortBy] || tasks.createdAt;
    const orderByClause =
      sortOrder === 'asc' ? asc(selectedColumn) : desc(selectedColumn);

    const data = await this.dbService.db
      .select()
      .from(tasks)
      .where(whereClause)
      .orderBy(orderByClause)
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

  async findAllSystemTasks(): Promise<Task[]> {
    return await this.dbService.db.select().from(tasks);
  }

  async getTaskStats(userId: number) {
    const now = new Date();

    const [stats] = await this.dbService.db
      .select({
        total: count(),
        completed: count(
          sql`CASE WHEN ${tasks.status} = 'completed' THEN 1 END`,
        ),
        todo: count(sql`CASE WHEN ${tasks.status} = 'todo' THEN 1 END`),
        inProgress: count(
          sql`CASE WHEN ${tasks.status} = 'in_progress' THEN 1 END`,
        ),
        overdue: count(
          sql`CASE WHEN ${tasks.status} != 'COMPLETED' AND ${tasks.dueDate} < ${now} THEN 1 END`,
        ),
        highPriority: count(
          sql`CASE WHEN ${tasks.priority} = 'high' THEN 1 END`,
        ),
        mediumPriority: count(
          sql`CASE WHEN ${tasks.priority} = 'medium' THEN 1 END`,
        ),
        lowPriority: count(sql`CASE WHEN ${tasks.priority} = 'low' THEN 1 END`),
      })
      .from(tasks)
      .where(eq(tasks.userId, userId));

    const total = Number(stats.total);
    const completed = Number(stats.completed);
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completionRate: `${completionRate}%`,
      statuses: {
        completed: Number(stats.completed),
        pending: Number(stats.todo),
        inProgress: Number(stats.inProgress),
        overdue: Number(stats.overdue),
      },
      priorities: {
        high: Number(stats.highPriority),
        medium: Number(stats.mediumPriority),
        low: Number(stats.lowPriority),
      },
    };
  }
}
