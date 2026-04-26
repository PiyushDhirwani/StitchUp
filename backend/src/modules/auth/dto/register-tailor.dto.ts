import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
  IsInt,
} from 'class-validator';

export class RegisterTailorDto {
  @ApiProperty({ example: 'Rajesh' })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Kumar' })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({ example: 'tailor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9123456789' })
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  phone_number: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Expert Tailoring' })
  @IsNotEmpty()
  @IsString()
  shop_name: string;

  @ApiProperty({ example: '456 Shop Street' })
  @IsNotEmpty()
  @IsString()
  shop_address_line1: string;

  @ApiPropertyOptional({ example: 'Floor 2' })
  @IsOptional()
  @IsString()
  shop_address_line2?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: '400001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  postal_code: string;

  @ApiPropertyOptional({ example: 'India', default: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 19.076 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 72.8777 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Individual' })
  @IsOptional()
  @IsString()
  business_type?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  years_of_experience?: number;

  @ApiPropertyOptional({ example: 'Expert in salwar suits and kurtas' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'SHOP123456' })
  @IsOptional()
  @IsString()
  shop_registration_number?: string;
}
