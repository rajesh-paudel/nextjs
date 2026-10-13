import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    { id: 1, title: 'do homework', completed: false },
    { id: 2, title: 'visit places', completed: true },
    { id: 3, title: 'sleep', completed: false },
  ];
  create(createTaskDto: CreateTaskDto) {
    const newTask = {
      id: Date.now(),
      title: createTaskDto.title,
      completed: createTaskDto.completed ?? false,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  findAll() {
    return this.tasks;
  }

  findOne(id: number) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`task not found for this id : ${id}`);
    }
    return task;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const updatedTask = {
      ...this.tasks[index],
      ...updateTaskDto,
    };

    this.tasks[index] = updatedTask;

    return updatedTask;
  }

  remove(id: number) {
    const deletionIndex = this.tasks.findIndex((task) => task.id === id);
    if (deletionIndex === -1)
      throw new NotFoundException(`task with id ${id} not found`);
    return this.tasks.splice(deletionIndex, 1)[0];
  }
}
