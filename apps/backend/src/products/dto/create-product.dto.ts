import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsUUID, Min, IsObject } from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({ example: 'VARIANT-001' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Red - Large' })
  @IsString()
  title: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 39.99, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  comparePrice?: number;

  @ApiProperty({ example: 0.5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @ApiProperty({ example: '{"color": "Red", "size": "Large"}', required: false })
  @IsString()
  @IsOptional()
  attributes?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateProductImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ example: 'Product image', required: false })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'PROD-001' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Amazing Product' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'amazing-product' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'This is an amazing product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Short description', required: false })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 39.99, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  comparePrice?: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 0.5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @ApiProperty({ example: '{"length": 10, "width": 5, "height": 2}', required: false })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isDigital?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ example: 'Product Meta Title', required: false })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({ example: 'Product meta description', required: false })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({ example: '["electronics", "gadgets"]', required: false })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiProperty({ example: '{"brand": "Apple", "color": "Space Gray"}', required: false })
  @IsString()
  @IsOptional()
  attributes?: string;

  @ApiProperty({ example: 'category-uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ type: [CreateProductVariantDto], required: false })
  @IsArray()
  @IsOptional()
  variants?: CreateProductVariantDto[];

  @ApiProperty({ type: [CreateProductImageDto], required: false })
  @IsArray()
  @IsOptional()
  images?: CreateProductImageDto[];
}
