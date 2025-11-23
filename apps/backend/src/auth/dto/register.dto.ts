import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: false, description: 'Register as a seller/vendor' })
  @IsOptional()
  @IsBoolean()
  isSeller?: boolean;

  @ApiProperty({ example: 'My Store', description: 'Business name for seller accounts' })
  @IsOptional()
  @IsString()
  businessName?: string;
}
