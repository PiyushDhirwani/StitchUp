import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsNumber, Min } from 'class-validator';

export class CreatePaymentOrderDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  template_type_id: number;

  @ApiProperty({ example: 1500 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}
