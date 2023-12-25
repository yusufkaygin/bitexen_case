import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WalletCreateDto {
  @ApiProperty({
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  currencyId: string;

  // -------------------------------

  @ApiProperty({
    example: 300,
  })
  balance: number;

  @IsOptional()
  accountId: string;
}
