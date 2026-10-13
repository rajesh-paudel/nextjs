import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
