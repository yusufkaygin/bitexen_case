import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WalletDepositDto {
  @ApiProperty({
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  walletId: string;

  // -------------------------------

  @ApiProperty({
    example: 300,
  })
  amount: number;

  @IsOptional()
  accountId: string;
}
