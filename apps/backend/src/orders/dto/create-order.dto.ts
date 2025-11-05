import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({ description: 'Product variant ID' })
  @IsString()
  @IsOptional()
  variantId?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Billing address ID' })
  @IsString()
  @IsNotEmpty()
  billingAddressId: string;

  @ApiProperty({ description: 'Shipping address ID' })
  @IsString()
  @IsNotEmpty()
  shippingAddressId: string;

  @ApiPropertyOptional({ description: 'Coupon code' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Shipping amount' })
  @IsOptional()
  shippingAmount?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsOptional()
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Order notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment method', enum: ['card', 'cash_on_delivery'] })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

