import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsInt } from 'class-validator';

export class UpdateTailorProfileDto {
  @ApiPropertyOptional({ example: 'Rajesh' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Kumar' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/pic.jpg' })
  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  @ApiPropertyOptional({ example: 'Expert Tailoring Plus' })
  @IsOptional()
  @IsString()
  shop_name?: string;

  @ApiPropertyOptional({ example: '456 Shop Street' })
  @IsOptional()
  @IsString()
  shop_address_line1?: string;

  @ApiPropertyOptional({ example: 'Floor 2' })
  @IsOptional()
  @IsString()
  shop_address_line2?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '400001' })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiPropertyOptional({ example: 19.076 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 72.8777 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Partnership' })
  @IsOptional()
  @IsString()
  business_type?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  years_of_experience?: number;

  @ApiPropertyOptional({ example: 'Expert in salwar suits' })
  @IsOptional()
  @IsString()
  bio?: string;
}
