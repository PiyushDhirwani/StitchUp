import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTicketDto {
  @ApiProperty({ example: 'quality_issue', enum: ['quality_issue', 'delay', 'miscommunication', 'payment_issue', 'material_issue', 'measurement_issue', 'refund_request', 'other'] })
  @IsNotEmpty()
  @IsEnum(['quality_issue', 'delay', 'miscommunication', 'payment_issue', 'material_issue', 'measurement_issue', 'refund_request', 'other'])
  ticket_type: string;

  @ApiProperty({ example: 'Issue with my kurta order' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: 'The stitching quality is not as expected...' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit Indian mobile number' })
  phone_number: string;

  @ApiPropertyOptional({ example: 42, description: 'Related order ID (if applicable)' })
  @IsOptional()
  @Transform(({ value }) => {
    const n = Number(value);
    return value === '' || value === null || value === undefined || isNaN(n) || n === 0 ? undefined : n;
  })
  @IsInt()
  order_id?: number;

  @ApiPropertyOptional({ example: 'high', enum: ['low', 'medium', 'high', 'critical'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: string;
}
