import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  task: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockNotificationsService = {
  create: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a task if found', async () => {
      const mockTask = { id: '1', title: 'Test Task', deletedAt: null };
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne('1');
      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: '1', deletedAt: null },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if task is not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createDto: any = { title: 'New Task', projectId: 'p1' };
      const reporterId = 'r1';
      const mockCreatedTask = { id: '1', ...createDto, reporterId };

      mockPrismaService.task.create.mockResolvedValue(mockCreatedTask);

      const result = await service.create(createDto, reporterId);

      expect(result).toEqual(mockCreatedTask);
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Task',
          projectId: 'p1',
          reporterId: 'r1',
        }),
        include: expect.any(Object),
      });
    });
  });
});
