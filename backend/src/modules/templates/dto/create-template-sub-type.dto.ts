import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';

export class CreateTemplateSubTypeDto {
  @ApiProperty({ example: 'Slim Fit Shirt' })
  @IsNotEmpty()
  @IsString()
  sub_type_name: string;

  @ApiPropertyOptional({ example: 'Modern slim-fit cut with tapered sides' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Measure chest snugly; allow 1 inch ease' })
  @IsOptional()
  @IsString()
  sizing_notes?: string;

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
