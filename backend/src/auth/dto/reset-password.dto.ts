import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The reset token sent via email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'The new password' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
