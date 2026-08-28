import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'UUID of the project' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiPropertyOptional({ description: 'UUID of the assignee' })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  actualHours?: number;
}
