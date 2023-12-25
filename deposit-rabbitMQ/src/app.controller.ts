import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

interface WalletDepositDto {
  walletId: string;
  amount: number;
}

@Controller()
export class AppController {
  constructor(@Inject('WALLET_SERVICE') private readonly client: ClientProxy) {}

  @Post('api/rabbit/deposit')
  deposit(
    @Body() walletDepositDto: WalletDepositDto,
    @Headers('token') token: string,
  ) {
    this.client.emit('wallet_deposit', { token, walletDepositDto });

    return {
      isError: false,
      message: 'İsteğiniz kuyruğa gönderildi...',
    };
  }
}
