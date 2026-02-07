import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId,
    });
    return this.tasksRepository.save(task);
  }

  async createBulk(tasks: CreateTaskDto[], userId: string): Promise<Task[]> {
    const taskEntities = tasks.map((task) =>
      this.tasksRepository.create({ ...task, userId }),
    );
    return this.tasksRepository.save(taskEntities);
  }

  async findAll(
    filterDto: TaskFilterDto,
    user: User,
  ): Promise<PaginatedResponseDto<Task>> {
    const { page = 1, limit = 10, status, priority } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.tasksRepository.createQueryBuilder('task');

    // Non-admin users can only see their own tasks
    if (user.role !== UserRole.ADMIN) {
      queryBuilder.where('task.userId = :userId', { userId: user.id });
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    queryBuilder.orderBy('task.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (user.role !== UserRole.ADMIN && task.userId !== user.id) {
      throw new ForbiddenException('You can only access your own tasks');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOne(id, user);
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);
    await this.tasksRepository.remove(task);
  }
}
