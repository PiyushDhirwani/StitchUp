import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
  MaxLength,
  IsEmail,
  Min,
} from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  razorpay_order_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  razorpay_signature: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  template_type_id: number;

  @ApiProperty({ example: 'manual_measurements', enum: ['manual_measurements', 'reference_clothing'] })
  @IsNotEmpty()
  @IsEnum(['manual_measurements', 'reference_clothing'])
  measurement_method: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  measurements?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Cloudinary URL for audio recording of measurements' })
  @IsOptional()
  @IsString()
  measurement_audio_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  special_instructions?: string;

  @ApiPropertyOptional({ description: 'Cloudinary URL for audio recording of special instructions' })
  @IsOptional()
  @IsString()
  special_instructions_audio_url?: string;

  @ApiProperty({ example: 'A-201' })
  @IsNotEmpty()
  @IsString()
  delivery_flat_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  delivery_address_line1: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  delivery_city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  delivery_state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  delivery_postal_code: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  contact_phone: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  contact_email: string;

  @ApiProperty({ example: 'self_parcel', enum: ['pickup', 'self_parcel'] })
  @IsNotEmpty()
  @IsEnum(['pickup', 'self_parcel'])
  delivery_method: string;

  @ApiPropertyOptional({ example: 100, description: 'Pickup fee if delivery_method is pickup' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pickup_fee?: number;
}
