import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CurrencyCreateDto {
  @ApiProperty({
    example: 'Dolar',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
