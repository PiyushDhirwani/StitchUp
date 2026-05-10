import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CheckServiceabilityDto {
  @ApiProperty({ example: '110001', description: 'Pickup/origin pincode' })
  @IsNotEmpty()
  @IsString()
  pickup_postcode: string;

  @ApiProperty({ example: '400001', description: 'Delivery pincode' })
  @IsNotEmpty()
  @IsString()
  delivery_postcode: string;

  @ApiProperty({ example: 0.5, description: 'Package weight in kg' })
  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @ApiProperty({ example: 0, description: '0 for Prepaid, 1 for COD', enum: [0, 1] })
  @IsNotEmpty()
  cod: 0 | 1;
}
