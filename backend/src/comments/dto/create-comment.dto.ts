import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'UUID of the task' })
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of user IDs mentioned',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  mentionIds?: string[];
}
