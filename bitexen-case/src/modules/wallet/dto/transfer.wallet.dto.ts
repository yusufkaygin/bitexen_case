import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WalletTransferDto {
  @IsOptional()
  fromAccountId: string;

  // -------------------------------

  @ApiProperty({
    example: 'targetId',
  })
  @IsString()
  @IsNotEmpty()
  toAccountId: string;

  // -------------------------------

  @ApiProperty({
    example: 'currencyId',
  })
  @IsString()
  @IsNotEmpty()
  currencyId: string;

  // -------------------------------

  @ApiProperty({
    example: 250,
  })
  amount: number;
}
