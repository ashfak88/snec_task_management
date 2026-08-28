import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Array of permission IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
