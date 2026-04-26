import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomizationItemDto {
  @ApiProperty({ example: 'embroidery' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ example: 'Simple Embroidery' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ example: 'sq_inches' })
  @IsOptional()
  @IsString()
  quantity_unit?: string;
}

export class CalculatePriceDto {
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

  @ApiPropertyOptional({ example: 'standard', enum: ['standard', 'plus_size', 'petite', 'athletic', 'custom_proportions'] })
  @IsOptional()
  @IsString()
  body_config?: string;

  @ApiPropertyOptional({ type: [CustomizationItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomizationItemDto)
  customizations?: CustomizationItemDto[];

  @ApiPropertyOptional({ example: 'normal', enum: ['normal', 'express', 'priority'] })
  @IsOptional()
  @IsString()
  urgency_level?: string;

  @ApiPropertyOptional({ example: 'SAVE10' })
  @IsOptional()
  @IsString()
  discount_code?: string;
}
