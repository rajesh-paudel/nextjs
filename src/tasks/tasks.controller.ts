import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { GetTaskQueryDto } from './dto/get-tasks-query.dto.js';
import { GetUser } from '../auth/decorators/get-user-decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/role.decorator.js';
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('all-system-tasks')
  findAllSystemTasks() {
    return this.tasksService.findAllSystemTasks();
  }

  @Get('stats')
  getStats(@GetUser('userId') userId: number) {
    return this.tasksService.getTaskStats(userId);
  }

  @Get()
  findAll(
    @GetUser('userId') userId: number,
    @Query() getTasksQueryDto: GetTaskQueryDto,
  ) {
    return this.tasksService.findAll(userId, getTasksQueryDto);
  }

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser('userId') userId: number,
  ) {
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('userId') userId: number,
  ) {
    return this.tasksService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser('userId') userId: number,
  ) {
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('userId') userId: number,
  ) {
    return this.tasksService.remove(id, userId);
  }
}
