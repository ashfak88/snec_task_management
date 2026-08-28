import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadAttachmentDto {
  @ApiProperty({ description: 'The entity type (e.g., TASK, PROJECT)' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ description: 'The entity ID' })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;
}
