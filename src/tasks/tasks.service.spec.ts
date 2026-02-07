import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { User, UserRole } from '../users/entities/user.entity';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<Repository<Task>>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    role: UserRole.USER,
  } as User;

  const mockAdminUser = {
    id: 'admin-uuid',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  } as User;

  const mockTask: Task = {
    id: 'task-uuid',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date(),
    userId: 'user-uuid',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(Task));
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      repository.create.mockReturnValue(mockTask);
      repository.save.mockResolvedValue(mockTask);

      const result = await service.create(
        { title: 'Test Task', description: 'Test Description' },
        'user-uuid',
      );

      expect(result).toEqual(mockTask);
      expect(repository.create).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        userId: 'user-uuid',
      });
    });
  });

  describe('findOne', () => {
    it('should return a task for the owner', async () => {
      repository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('task-uuid', mockUser);

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('task-uuid', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const otherUserTask = { ...mockTask, userId: 'other-user-uuid' };
      repository.findOne.mockResolvedValue(otherUserTask);

      await expect(service.findOne('task-uuid', mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin to access any task', async () => {
      const otherUserTask = { ...mockTask, userId: 'other-user-uuid' };
      repository.findOne.mockResolvedValue(otherUserTask);

      const result = await service.findOne('task-uuid', mockAdminUser);

      expect(result).toEqual(otherUserTask);
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      repository.findOne.mockResolvedValue(mockTask);
      repository.save.mockResolvedValue({
        ...mockTask,
        title: 'Updated Title',
      });

      const result = await service.update(
        'task-uuid',
        { title: 'Updated Title' },
        mockUser,
      );

      expect(result.title).toBe('Updated Title');
    });
  });

  describe('remove', () => {
    it('should remove a task successfully', async () => {
      repository.findOne.mockResolvedValue(mockTask);
      repository.remove.mockResolvedValue(mockTask);

      await expect(
        service.remove('task-uuid', mockUser),
      ).resolves.not.toThrow();
    });
  });
});
