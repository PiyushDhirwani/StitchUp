import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';

export class CreateTemplateTypeDto {
  @ApiProperty({ example: 'Shirt' })
  @IsNotEmpty()
  @IsString()
  type_name: string;

  @ApiPropertyOptional({ example: 'Classic formal and casual shirts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'men' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['active', 'retired'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'retired'])
  status?: string;

  @ApiPropertyOptional({ example: 1, description: 'Display order for sorting' })
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;
}
