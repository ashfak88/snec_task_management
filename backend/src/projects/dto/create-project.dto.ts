import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

enum Status {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsEnum(Priority)
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of user IDs to add as members',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  memberIds?: string[];
}
