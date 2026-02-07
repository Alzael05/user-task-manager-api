import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { TasksService } from './tasks.service';
import { StorageService } from '../storage/storage.service';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  BulkUploadResponseDto,
  BulkUploadErrorDto,
} from './dto/bulk-upload-response.dto';
import { TaskStatus, TaskPriority } from './entities/task.entity';

interface CsvRow {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

@Injectable()
export class CsvUploadService {
  private readonly logger = new Logger(CsvUploadService.name);

  constructor(
    private tasksService: TasksService,
    private storageService: StorageService,
  ) {}

  async processUpload(
    file: Express.Multer.File,
    userId: string,
  ): Promise<BulkUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    // Upload to S3
    const fileKey = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      'text/csv',
    );

    // Parse CSV
    let records: CsvRow[];
    try {
      records = parse(file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new BadRequestException('Invalid CSV format');
    }

    const errors: BulkUploadErrorDto[] = [];
    const validTasks: CreateTaskDto[] = [];

    // Validate each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 because of header and 0-index

      const dto = plainToInstance(CreateTaskDto, this.mapRowToDto(row));
      const validationErrors = validateSync(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (validationErrors.length > 0) {
        errors.push({
          row: rowNumber,
          errors: validationErrors.flatMap((e) =>
            e.constraints ? Object.values(e.constraints) : [],
          ),
        });
        continue;
      }

      validTasks.push(dto);

      /* const rowErrors = this.validateRow(row);

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, errors: rowErrors });
        continue;
      }

      validTasks.push(this.mapRowToDto(row)); */
    }

    // Create valid tasks
    if (validTasks.length > 0) {
      await this.tasksService.createBulk(validTasks, userId);
    }

    this.logger.log(
      `Bulk upload completed: ${validTasks.length} success, ${errors.length} failures`,
    );

    return {
      totalRows: records.length,
      successCount: validTasks.length,
      failureCount: errors.length,
      errors,
      fileKey,
    };
  }

  /* private validateRow(row: CsvRow): string[] {
    const errors: string[] = [];

    if (!row.title || row.title.trim() === '') {
      errors.push('Title is required');
    } else if (row.title.length > 255) {
      errors.push('Title must be at most 255 characters');
    }

    const taskStatuses = Object.values(TaskStatus);

    if (row.status && !taskStatuses.includes(row.status as TaskStatus)) {
      errors.push(
        `Invalid status. Must be one of: [${taskStatuses.join(', ')}]`,
      );
    }

    const taskPriorities = Object.values(TaskPriority);
    if (
      row.priority &&
      !taskPriorities.includes(row.priority as TaskPriority)
    ) {
      errors.push(
        `Invalid priority. Must be one of: [${taskPriorities.join(', ')}]`,
      );
    }

    if (row.dueDate) {
      const date = new Date(row.dueDate);

      if (isNaN(date.getTime())) {
        errors.push(
          'Invalid due date format. Use ISO 8601 format (e.g., 2026-03-01)',
        );
      }
    }

    return errors;
  } */

  private mapRowToDto(row: CsvRow): CreateTaskDto {
    return {
      title: row.title,
      description: row.description || undefined,
      status: (row.status as TaskStatus) || TaskStatus.PENDING,
      priority: (row.priority as TaskPriority) || TaskPriority.MEDIUM,
      dueDate: row.dueDate || undefined,
    };
  }
}
