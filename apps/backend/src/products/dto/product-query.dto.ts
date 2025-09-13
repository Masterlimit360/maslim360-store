import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductQueryDto {
  @ApiProperty({ example: 1, required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ example: 'electronics', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'laptop', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 10, required: false })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ example: 1000, required: false })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ example: 'createdAt', required: false })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({ example: 'desc', required: false })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiProperty({ example: true, required: false })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
