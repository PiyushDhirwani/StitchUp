import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsString, Min, Max, IsArray } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsInt()
  order_id: number;

  @ApiProperty({ example: 4, description: '1-5 star rating' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  overall_rating: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  quality_rating?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  timeliness_rating?: number;

  @ApiPropertyOptional({ example: 'Great stitching!' })
  @IsOptional()
  @IsString()
  review_title?: string;

  @ApiPropertyOptional({ example: 'The kurta fits perfectly and the fabric quality is excellent.' })
  @IsOptional()
  @IsString()
  review_text?: string;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/photo1.jpg'] })
  @IsOptional()
  @IsArray()
  photos_url?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  share_photo_publicly?: boolean;
}
