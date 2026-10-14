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
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @GetUser('userId') userId: number,
    @Query() getTasksQueryDto: GetTaskQueryDto,
  ) {
    return this.tasksService.findAll(userId, getTasksQueryDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('userId') userId: number,
  ) {
    return this.tasksService.findOne(id, userId);
  }

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser('userId') userId: number,
  ) {
    return this.tasksService.create(createTaskDto, userId);
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
