import { IsOptional, IsString, IsInt, Min, IsEnum, IsDateString } from 'class-validator';
import { TaskPriority, TaskStatus } from './create-task.dto.js';
import { Type } from 'class-transformer';
export class GetTaskQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  // Date Range Filters
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

  //  Sorting 
  @IsOptional()
  @IsEnum(['createdAt', 'dueDate', 'priority', 'title'])
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title' = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
