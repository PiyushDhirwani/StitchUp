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

export class RegisterConsumerDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  phone_number: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}|;:'",.<>?/`~])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsNotEmpty()
  @IsString()
  address_line1: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  address_line2?: string;

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
  @Matches(/^[1-9][0-9]{5}$/, { message: 'Postal code must be a valid 6-digit Indian PIN code' })
  postal_code: string;

  @ApiPropertyOptional({ example: 'India', default: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Fashion enthusiast' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 19.076 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 72.8777 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: '38J-7F4-6K2L', description: 'India Post DigiPIN derived from coordinates' })
  @IsOptional()
  @IsString()
  digipin?: string;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  preferred_radius_km?: number;
}
