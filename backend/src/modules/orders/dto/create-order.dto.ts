import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsNumber, IsBoolean, MaxLength, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CustomizationItemDto } from '../../pricing/dto/calculate-price.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 45 })
  @IsNotEmpty()
  @IsInt()
  consumer_id: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  template_type_id: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  template_sub_type_id: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsInt()
  material_id: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  body_measurement_id: number;

  @ApiProperty({ example: 2.5 })
  @IsNotEmpty()
  @IsNumber()
  fabric_length_meters: number;

  @ApiProperty({ example: '2026-05-10' })
  @IsNotEmpty()
  @IsDateString()
  delivery_date: string;

  @ApiPropertyOptional({ example: 'normal', enum: ['normal', 'express', 'priority'] })
  @IsOptional()
  @IsString()
  urgency_level?: string;

  @ApiPropertyOptional({ type: [CustomizationItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomizationItemDto)
  customizations?: CustomizationItemDto[];

  @ApiPropertyOptional({ example: 'Please ensure perfect fit', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  special_instructions?: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsNotEmpty()
  @IsString()
  delivery_address_line1: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  delivery_address_line2?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsNotEmpty()
  @IsString()
  delivery_city: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsNotEmpty()
  @IsString()
  delivery_state: string;

  @ApiProperty({ example: '400001' })
  @IsNotEmpty()
  @IsString()
  delivery_postal_code: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_delivery_same_as_profile?: boolean;

  @ApiPropertyOptional({ example: 'SAVE10' })
  @IsOptional()
  @IsString()
  discount_code?: string;
}
