import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({ description: 'UUID of the role' })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
